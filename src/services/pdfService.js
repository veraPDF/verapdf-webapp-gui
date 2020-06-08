import _ from 'lodash';

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

export { convertContextToPath, concatBoundingBoxes, convertContextToString, findAllMcid };
