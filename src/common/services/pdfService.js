import _ from 'lodash';

const COLOR = {
    DEFAULT: 'rgba(0, 0, 0, 0.75)',
    DEFAULT_CONTRAST: 'rgba(255, 255, 255, 0.75)',
    HOVER: 'rgba(0, 0, 0, 0.75)',
    ACTIVE: 'rgba(207, 63, 79, 0.60)',
    SECONDARY: 'rgba(207,109,63,0.2)',
};

// unite bboxes in single one
function concatBoundingBoxes(newBoundingBox, oldBoundingBox) {
    if (_.isNil(oldBoundingBox) && _.isNil(newBoundingBox)) {
        return {};
    }

    if (_.isNil(newBoundingBox)) {
        return oldBoundingBox;
    }
    if (_.isNil(oldBoundingBox)) {
        return _.cloneDeep(newBoundingBox);
    }
    return {
        x: Math.min(newBoundingBox.x, oldBoundingBox.x),
        y: Math.min(newBoundingBox.y, oldBoundingBox.y),
        width:
            Math.max(newBoundingBox.x + newBoundingBox.width, oldBoundingBox.x + oldBoundingBox.width) -
            Math.min(newBoundingBox.x, oldBoundingBox.x),
        height:
            Math.max(newBoundingBox.y + newBoundingBox.height, oldBoundingBox.y + oldBoundingBox.height) -
            Math.min(newBoundingBox.y, oldBoundingBox.y),
    };
}

/*
 *  Convert returning from veraPDF api path to error in array of nodes
 *
 *  @param errorContext {string} ugly path to error
 *
 *  @return arrayOfNodes {array} of nodes from Document to error Tag
 */
function convertContextToPath(errorContext = '') {
    let arrayOfNodes = [];
    if (!errorContext) {
        return arrayOfNodes;
    }

    let contextString = errorContext;

    try {
        if (contextString.includes('contentItem')) {
            let path = {};
            contextString.split('/').forEach(nodeString => {
                if (nodeString.includes('page')) {
                    path.pageIndex = parseInt(nodeString.split(/[[\]]/)[1], 10);
                } else if (nodeString.includes('contentItem') && nodeString.includes('mcid')) {
                    path.mcid = parseInt(nodeString.split('mcid:')[1].slice(0, -1), 10);
                }
            });
            return path;
        } else if (contextString.includes('annots')) {
            let path = {};
            contextString.split('/').forEach(nodeString => {
                if (nodeString.includes('page')) {
                    path.pageIndex = parseInt(nodeString.split(/[[\]]/)[1], 10);
                } else if (nodeString.includes('annots')) {
                    path.annot = parseInt(nodeString.split(/[[\]]/)[1], 10);
                }
            });
            return path;
        }

        contextString = contextString.split('PDStructTreeRoot)/')[1].split('/'); // cut path before start of Document

        contextString.forEach(nodeString => {
            const nextIndex = parseInt(nodeString.split('](')[0].split('K[')[1], 10);
            let nextTag = nodeString
                .split('(')[1]
                .split(')')[0]
                .split(' ');
            nextTag = nextTag[nextTag.length - 1];

            arrayOfNodes = [...arrayOfNodes, [nextIndex, nextTag]];
        });

        return arrayOfNodes;
    } catch (e) {
        return [];
    }
}

/*
 *  Convert returning from veraPDF api path to error place in readable string
 *
 *  @param errorContext {string} ugly path to error
 *
 *  @return path to node {string}
 */
function convertContextToString(errorContext = '') {
    let arrayOfNodes = convertContextToPath(errorContext);
    arrayOfNodes = arrayOfNodes.map(node => {
        return `[${node[0]}]${node[1]}`;
    });

    return arrayOfNodes.join(' -> ');
}

/*
 *  Going through object of tags from error placement and return array of its MCIDs
 *
 *  @param {Object} of tags
 *
 *  @return [{Array}, {Number}] - [[array of mcids], page of error]
 */
function findAllMcid(tagObject) {
    const listOfMcid = [];
    let pageIndex = -1;

    function func(obj) {
        if (!obj) return;
        if (obj.mcid || obj.mcid === 0) {
            listOfMcid.push(obj.mcid);
            if (pageIndex === -1) pageIndex = obj.pageIndex;
        }
        if (!obj.children) {
            return;
        }

        if (!(obj.children instanceof Array)) {
            func(obj.children);
        } else {
            obj.children.forEach(child => func(child));
        }
    }

    func(tagObject);

    return [listOfMcid, pageIndex];
}

function calculateBboxFromJSON(location) {
    const bboxes = [];
    const bboxMap = JSON.parse(location);

    bboxMap.bbox.forEach(({ p, rect }) => {
        const [x, y, x1, y1] = rect;
        const width = parseFloat(x1) - parseFloat(x);
        const height = parseFloat(y1) - parseFloat(y);
        bboxes.push({
            page: parseFloat(p),
            location: [parseFloat(x), parseFloat(y), width, height],
        });
    });
    return bboxes;
}

function calculateBboxFromLocation(location) {
    const bboxes = [];
    const [pages, boundingBox] = location.split('/');
    const [start, end] = pages
        .replace('pages[', '')
        .replace(']', '')
        .split('-');
    const [x, y, x1, y1] = boundingBox
        .replace('boundingBox[', '')
        .replace(']', '')
        .split(',');
    const width = parseFloat(x1) - parseFloat(x);

    if (end) {
        for (let i = parseInt(start); i <= parseInt(end); i++) {
            switch (i) {
                case parseInt(start):
                    bboxes.push({
                        page: i,
                        location: [parseFloat(x), parseFloat(y1), width, 'bottom'],
                    });
                    break;
                case parseInt(end):
                    bboxes.push({
                        page: i,
                        location: [parseFloat(x), parseFloat(y), width, 'top'],
                    });
                    break;
                default:
                    bboxes.push({
                        page: i,
                        location: [parseFloat(x), 0, width, 'top'],
                    });
                    break;
            }
        }
    } else {
        const height = parseFloat(y1) - parseFloat(y);
        bboxes.push({
            page: parseFloat(start),
            location: [parseFloat(x), parseFloat(y), width, height],
        });
    }

    return bboxes;
}

const convertRectToBbox = (rect, scale, canvasHeight) => {
    let { height, y } = rect;
    if (rect.height === 'top') {
        height = canvasHeight - rect.y;
    } else if (rect.height === 'bottom') {
        y = 0;
        height = rect.y;
    }
    return [rect.x * scale, y * scale, rect.width * scale, height * scale];
};

const calculateStokeColor = (pageNumber, bbox) => {
    const pdfcanvas = document.querySelector(`div.pdf-page[data-page="${pageNumber}"] .react-pdf__Page__canvas`);
    const pdfctx = pdfcanvas.getContext('2d');
    const pdfSize = pdfcanvas.getBoundingClientRect([]);
    let rArray = [];
    let gArray = [];
    let bArray = [];
    for (let i = 0; i < bbox[2]; i++) {
        const x1Color = pdfctx.getImageData(bbox[0] + i, -1 * (bbox[1] - pdfSize.height), 1, 1).data;
        const x2Color = pdfctx.getImageData(bbox[0] + i, -1 * (bbox[1] + bbox[3] - pdfSize.height), 1, 1).data;
        rArray = [...rArray, x1Color[0], x2Color[0]];
        gArray = [...gArray, x1Color[1], x2Color[1]];
        bArray = [...bArray, x1Color[2], x2Color[2]];
    }
    for (let i = 0; i < bbox[3]; i++) {
        const y1Color = pdfctx.getImageData(bbox[0], -1 * (bbox[1] - pdfSize.height), 1, 1).data;
        const y2Color = pdfctx.getImageData(bbox[0] + bbox[2], -1 * (bbox[1] + i - pdfSize.height), 1, 1).data;
        rArray = [...rArray, y1Color[0], y2Color[0]];
        gArray = [...gArray, y1Color[1], y2Color[1]];
        bArray = [...bArray, y1Color[2], y2Color[2]];
    }
    const r = _.mean(rArray);
    const g = _.mean(gArray);
    const b = _.mean(bArray);

    if (r * 0.299 + g * 0.587 + b * 0.114 > 50) {
        return COLOR.DEFAULT;
    } else {
        return COLOR.DEFAULT_CONTRAST;
    }
};

export {
    COLOR,
    convertContextToPath,
    concatBoundingBoxes,
    convertContextToString,
    findAllMcid,
    calculateBboxFromLocation,
    calculateBboxFromJSON,
    calculateStokeColor,
    convertRectToBbox,
};
