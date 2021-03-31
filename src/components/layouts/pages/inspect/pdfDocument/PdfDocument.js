import React from 'react';
import { connect } from 'react-redux';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { Document, pdfjs } from 'react-pdf';
import _ from 'lodash';
import $ from 'jquery';
import PropTypes from 'prop-types';

import PdfPageCanvas from '../pdfPageCanvas/PdfPageCanvas';
import PdfPage from '../pdfPage/PdfPage';
import { getPdfFiles } from '../../../../../store/pdfFiles/selectors';
import { getRuleSummaries } from '../../../../../store/job/result/selectors';
import {
    concatBoundingBoxes,
    convertContextToPath,
    findAllMcid,
    calculateBboxFromLocation,
} from '../../../../../services/pdfService';

import './PdfDocument.scss';

//  Set pdf.js build
const { PUBLIC_URL } = process.env;
pdfjs.GlobalWorkerOptions.workerSrc = `${PUBLIC_URL}/pdf.worker.js`;

let loadedPages = 0;
let scrollPosition = -1;
let preventScroll = false;

const COLOR = {
    DEFAULT: 'grey',
    HOVER: 'rgba(0, 0, 0, 0.75)',
    ACTIVE: 'rgba(207, 63, 79, 0.50)',
};

const scrollToStoredPosition = () => {
    const $document = document.querySelector('.inspect-document');
    if (scrollPosition > -1) {
        const { scrollHeight } = $document;
        $document.scrollTop = (scrollHeight * scrollPosition) / 100;
    }

    scrollPosition = -1;
};

class PdfDocument extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            numPages: null,
            renderedPages: 0,
            error: null,
            bboxByPage: {},
            errorsRects: {},
            hoveredKey: null,
            canvasPages: {},
            shownPages: [],
            pagesMap: {},
            defaultHeight: 0,
            defaultWidth: 0,
            mapOfErrors: null,
            structureTree: {},
            annotationsByPage: {},
        };
    }

    getTagsFromErrorPlace = context => {
        const defaultValue = [[], -1];
        let selectedTag = convertContextToPath(context);

        if (_.isEmpty(selectedTag)) {
            return defaultValue;
        }

        if (selectedTag.hasOwnProperty('mcid') && selectedTag.hasOwnProperty('pageIndex')) {
            return [[selectedTag.mcid], selectedTag.pageIndex];
        } else if (selectedTag.hasOwnProperty('annot') && selectedTag.hasOwnProperty('pageIndex')) {
            return [{ annot: selectedTag.annot }, selectedTag.pageIndex];
        } else if (selectedTag instanceof Array) {
            let objectOfErrors = { ...this.state.structureTree };
            selectedTag.forEach(node => {
                let nextStepObject;
                if (!objectOfErrors.children) {
                    nextStepObject = objectOfErrors[node[0]];
                } else if (!(objectOfErrors.children instanceof Array)) {
                    if (objectOfErrors.children.name === node[1]) {
                        nextStepObject = objectOfErrors.children;
                    } else {
                        nextStepObject = objectOfErrors;
                    }
                } else {
                    if (objectOfErrors?.name === 'Document' && objectOfErrors?.name === node[1]) {
                        nextStepObject = objectOfErrors;
                    } else {
                        nextStepObject = { ...objectOfErrors.children[node[0]] };
                    }
                }

                objectOfErrors = { ...nextStepObject };
            });
            return findAllMcid(objectOfErrors);
        }
        return defaultValue;
    };

    componentDidUpdate(prevProps) {
        if (
            _.isNull(this.state.mapOfErrors) &&
            !_.isNil(this.props.ruleSummaries) &&
            !(_.isObject(this.state.structureTree) && _.isEmpty(this.state.structureTree))
        ) {
            const mapOfErrors = {};
            this.props.ruleSummaries.forEach((summary, index) => {
                summary.checks.forEach((check, checkIndex) => {
                    let listOfMcid = [];
                    let pageIndex = -1;
                    if (!check.location) {
                        [listOfMcid, pageIndex] = this.getTagsFromErrorPlace(check.context);
                    } else {
                        listOfMcid = [];
                        pageIndex = parseInt(
                            check.location
                                .split('pages[')[1]
                                .split(']')[0]
                                .split('-')[0]
                        );
                    }
                    mapOfErrors[`${index}:${checkIndex}:${check.location || check.context}`] = {
                        listOfMcid,
                        pageIndex,
                        location: check.location,
                    };
                });
            });
            this.setState({ mapOfErrors });
            this.props.onDocumentReady({ ...mapOfErrors });
        }

        // clear old selection and fill new one
        if (this.props.selectedCheck !== prevProps.selectedCheck) {
            let prevPages = [];
            if (this.state.errorsRects[prevProps.selectedCheck]) {
                prevPages =
                    this.state.errorsRects[prevProps.selectedCheck] instanceof Array
                        ? this.state.errorsRects[prevProps.selectedCheck]
                        : [this.state.errorsRects[prevProps.selectedCheck]];
            } else {
                prevPages =
                    this.state.mapOfErrors[this.props.selectedCheck] instanceof Array
                        ? this.state.mapOfErrors[this.props.selectedCheck]
                        : [this.state.mapOfErrors[this.props.selectedCheck]];
            }
            prevPages.forEach(prevCheck => {
                if (prevCheck && _.isNumber(prevCheck.pageIndex)) {
                    this.redrawCanvasByPage(prevCheck.pageIndex);
                }
            });
            this.autoSelectRect();
        }

        if (this.props.scale !== prevProps.scale) {
            this.setState({
                canvasPages: {},
                shownPages: [],
                pagesMap: this.getPages(undefined, this.props.scale),
            });
        }
    }

    //  Init data of uploaded PDF
    onDocumentLoadSuccess = document => {
        loadedPages = 0;
        const structureTree = document._pdfInfo.structureTree;
        document.getMetadata().then(({ info }) => {
            const { Title } = info;

            const fileTitle = Title || this.props.file.name;
            this.props.setPdfName(fileTitle);
            this.setState({
                shownPages: [1],
                structureTree,
            });
        });
        const { numPages } = document;
        this.setState({ numPages, pagesMap: this.getPages(1) });
    };

    onFirstPageSuccess = async page => {
        const operatorList = await page.getOperatorList();
        let annotations = await page.getAnnotations();

        const annotationsByPage = { ...this.state.annotationsByPage };
        annotationsByPage[page.pageIndex] = annotations;

        const positionData = operatorList.argsArray[operatorList.argsArray.length - 1];
        const pageIndex = 0;

        const { bboxByPage, canvasPages } = this.state;
        const newBboxByPage = { ...bboxByPage };
        newBboxByPage[pageIndex] = positionData || {};

        const canvas = document.getElementsByTagName('canvas')[0];
        const rect = canvas.getBoundingClientRect();
        const pagesArray = { ...canvasPages };
        const canvasStylesObject = {
            top: `${canvas.parentElement.parentElement.offsetTop}px`,
            left: '50%',
            height: `${rect.height}px`,
            width: `${rect.width}px`,
            position: 'absolute',
            transform: 'translateX(-50%)',
        };

        pagesArray[pageIndex] = (
            <PdfPageCanvas
                key={`bboxCanvas${pageIndex}`}
                id={`bboxCanvas${pageIndex}`}
                style={canvasStylesObject}
                pageIndex={pageIndex}
                height={rect.height}
                width={rect.width}
                onMouseMove={this.onCanvasMouseMove}
                onClick={this.onCanvasClick}
                onMount={() => {
                    this.state.renderedPages += 1;
                }}
            />
        );
        loadedPages++;

        this.state.defaultHeight = rect.height;
        this.state.defaultWidth = rect.width;

        this.setState({
            bboxByPage: newBboxByPage,
            canvasPages: pagesArray,
            pagesMap: this.getPages(),
            annotationsByPage,
        });

        setTimeout(() => {
            this.loadPagesIsNeeded();
            this.fillErrorsRects(page.pageIndex);
            scrollToStoredPosition();
        }, 100);
    };

    //  Create page overlay for BBOXes
    onPageRenderSuccess = page => {
        Promise.all([page.getOperatorList(), page.getAnnotations()]).then(([operatorList, annotations]) => {
            const annotationsByPage = { ...this.state.annotationsByPage };
            annotationsByPage[page.pageIndex] = annotations;

            const positionData = operatorList.argsArray[operatorList.argsArray.length - 1];

            const bboxByPage = { ...this.state.bboxByPage };
            bboxByPage[page.pageIndex] = positionData || {};

            const canvas = document.querySelector(`.react-pdf__Page[data-page-number="${page.pageNumber}"] > canvas`);
            const rect = canvas.getBoundingClientRect();
            const pagesArray = { ...this.state.canvasPages };
            const canvasStylesObject = {
                top: `${canvas.parentElement.parentElement.offsetTop}px`,
                left: '50%',
                height: `${rect.height}px`,
                width: `${rect.width}px`,
                position: 'absolute',
                transform: 'translateX(-50%)',
            };

            pagesArray[page.pageNumber] = (
                <PdfPageCanvas
                    key={`bboxCanvas${page.pageIndex}`}
                    id={`bboxCanvas${page.pageIndex}`}
                    style={canvasStylesObject}
                    pageIndex={page.pageIndex}
                    height={rect.height}
                    width={rect.width}
                    onMouseMove={this.onCanvasMouseMove}
                    onClick={this.onCanvasClick}
                    onMount={() => {
                        this.setState({ renderedPages: this.state.renderedPages + 1 });
                    }}
                />
            );

            loadedPages++;

            if (loadedPages === this.state.numPages) {
                setTimeout(() => {
                    if (this.state.renderedPages === this.state.numPages) {
                        scrollToStoredPosition();
                        this.setState(
                            {
                                renderedPages: 0,
                            },
                            () => {
                                this.fillErrorsRects(page.pageIndex);
                            }
                        );
                    }
                }, 100);

                this.setState({
                    bboxByPage,
                    annotationsByPage,
                    canvasPages: pagesArray,
                });
            } else {
                this.setState({
                    bboxByPage,
                    annotationsByPage,
                    canvasPages: pagesArray,
                });

                setTimeout(() => {
                    this.fillErrorsRects(page.pageIndex);
                }, 100);
            }
        });
    };

    //  Build pages
    getPages(limit = 0, scale = '') {
        const { numPages, defaultHeight, pagesMap } = this.state;
        limit = limit || numPages;

        for (let pageIndex = 1; pageIndex <= limit; pageIndex++) {
            if (!pagesMap[pageIndex] || scale) {
                scale = scale || 1;
                pagesMap[pageIndex] = (
                    <PdfPage
                        loading={pageIndex > 1}
                        pageIndex={pageIndex}
                        renderTextLayer={false}
                        onPageRenderSuccess={pageIndex === 1 ? this.onFirstPageSuccess : this.onPageRenderSuccess}
                        key={`page-${pageIndex}`}
                        scale={parseFloat(scale)}
                        style={{
                            position: 'relative',
                        }}
                        height={defaultHeight || 'auto'}
                        width={'auto'}
                    />
                );
            }
        }

        return pagesMap;
    }

    // eslint-disable-next-line react/sort-comp
    loadPagesIsNeeded() {
        const { shownPages } = this.state;
        const newShownPages = [...shownPages];
        const container = document.querySelector('.inspect-document');
        const docViewTop = container.scrollTop + container.offsetTop;
        const docViewBottom = docViewTop + $(container).height();
        setTimeout(() => {
            const inViewport = [...document.querySelectorAll('.pdf-page[data-loading="true"]')]
                .filter($pageElement => {
                    const elemTop = $pageElement.offsetTop;
                    const height = $($pageElement).height();
                    const elemBottom = elemTop + height;

                    return (
                        (elemBottom <= docViewBottom && elemBottom > docViewTop) ||
                        (elemTop < docViewBottom && elemTop >= docViewTop) ||
                        (elemBottom >= docViewBottom && elemTop <= docViewTop)
                    );
                })
                .map($pageElement => $pageElement.getAttribute('data-page'));

            inViewport.forEach(pageNumber => {
                pageNumber = parseInt(pageNumber, 10);
                if (!shownPages.includes(pageNumber)) {
                    newShownPages.push(pageNumber);
                    const loadPageEvent = new Event('loadPage');
                    loadPageEvent.pageNumber = pageNumber;
                    document.dispatchEvent(loadPageEvent);
                }
            });
        }, 200);
    }

    /*
     *   HANDLERS
     */

    onDocumentScroll = () => this.loadPagesIsNeeded();

    onCanvasMouseMove = e => {
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = canvas.offsetHeight - (e.clientY - rect.top);
        const ctx = canvas.getContext('2d');
        const pageIndex = parseInt(canvas.getAttribute('data-page'), 10);
        const errorsOnPage = [];
        let hoveredKey = null;

        Object.keys(this.state.errorsRects).forEach(key => {
            if (pageIndex === this.state.errorsRects[key].pageIndex) {
                errorsOnPage.push(key);
            }
            if (this.state.errorsRects[key] instanceof Array) {
                this.state.errorsRects[key].forEach(rect => {
                    if (pageIndex === rect.pageIndex) {
                        errorsOnPage.push(key);
                    }
                });
            }
        });

        errorsOnPage.forEach(key => {
            const rectsArray =
                this.state.errorsRects[key] instanceof Array
                    ? this.state.errorsRects[key]
                    : [this.state.errorsRects[key]];
            rectsArray.forEach(rect => {
                if (
                    x >= rect.x * this.props.scale &&
                    x <= rect.x * this.props.scale + rect.width * this.props.scale &&
                    y >= rect.y * this.props.scale &&
                    y <= rect.y * this.props.scale + rect.height * this.props.scale
                ) {
                    if (!hoveredKey) {
                        hoveredKey = key;
                    } else {
                        const hoveredRects =
                            this.state.errorsRects[hoveredKey] instanceof Array
                                ? this.state.errorsRects[hoveredKey]
                                : [this.state.errorsRects[hoveredKey]];
                        hoveredRects.forEach(hRect => {
                            if (
                                rect.pageIndex === hRect.pageIndex &&
                                rect.x >= hRect.x &&
                                rect.x + rect.width <= hRect.x + hRect.width &&
                                rect.y >= hRect.y &&
                                rect.y + rect.height <= hRect.y + hRect.height
                            ) {
                                hoveredKey = key;
                            }
                        });
                    }
                }
            });
        });

        if (hoveredKey !== this.state.hoveredKey) {
            this.redrawCanvasByPage(pageIndex);
            if (this.props.selectedCheck) {
                const hoveredPageIndexes =
                    this.state.errorsRects[this.props.selectedCheck] instanceof Array
                        ? this.state.errorsRects[this.props.selectedCheck].map(rect => rect.pageIndex)
                        : [this.state.errorsRects[this.props.selectedCheck]?.pageIndex];
                if (hoveredPageIndexes.includes(pageIndex)) {
                    hoveredPageIndexes.forEach(rect => {
                        this.redrawCanvasByPage(rect.pageIndex);
                    });
                    this.selectRect(this.state.errorsRects[this.props.selectedCheck]);
                }
            }

            if (hoveredKey) {
                const hoveredRect =
                    _.find(this.state.errorsRects[hoveredKey], { pageIndex: pageIndex }) ||
                    this.state.errorsRects[hoveredKey];
                const canvas = document.querySelector(`canvas[data-page="${hoveredRect.pageIndex}"]`);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                ctx.strokeStyle = COLOR.HOVER;
                ctx.strokeWidth = 10;
                ctx.strokeRect(
                    hoveredRect.x * this.props.scale,
                    hoveredRect.y * this.props.scale,
                    hoveredRect.width * this.props.scale,
                    hoveredRect.height * this.props.scale
                );
            }

            this.setState({
                hoveredKey,
            });
        }
    };

    onCanvasClick = () => {
        if (this.state.hoveredKey) {
            preventScroll = true;
            this.props.setSelectedCheck(this.state.hoveredKey);
        } else if (this.props.selectedCheck) {
            preventScroll = false;
            this.props.setSelectedCheck(null);
        }
    };

    onError = e => {
        scrollToStoredPosition();
        this.setState({
            error: e.message,
        });
    };

    fillErrorsRects(index) {
        const { errorsRects } = this.state;
        const mapOfBboxes = errorsRects || {};
        Object.keys(this.state.mapOfErrors).forEach(key => {
            if (index !== this.state.mapOfErrors[key].pageIndex) return;
            mapOfBboxes[key] = this.findBboxCoords(this.state.mapOfErrors[key]);
        });
        Object.keys(mapOfBboxes).forEach(key => {
            if (mapOfBboxes[key] instanceof Array) {
                return mapOfBboxes[key].forEach(rect => {
                    if (rect.pageIndex !== index) return;
                    const canvas = document.querySelector(`canvas[data-page="${rect.pageIndex}"]`);
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    ctx.strokeRect(
                        rect.x * this.props.scale,
                        rect.y * this.props.scale,
                        rect.width * this.props.scale,
                        rect.height * this.props.scale
                    );
                });
            }
            if (index !== mapOfBboxes[key].pageIndex) return;
            const canvas = document.querySelector(`canvas[data-page="${mapOfBboxes[key].pageIndex}"]`);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = COLOR.DEFAULT;
            ctx.strokeRect(
                mapOfBboxes[key].x * this.props.scale,
                mapOfBboxes[key].y * this.props.scale,
                mapOfBboxes[key].width * this.props.scale,
                mapOfBboxes[key].height * this.props.scale
            );
        });

        const autoSelect =
            this.props.selectedCheck &&
            (this.state.mapOfErrors[this.props.selectedCheck].location
                ? _.find(mapOfBboxes[this.props.selectedCheck], { pageIndex: index })
                : this.state.mapOfErrors[this.props.selectedCheck].pageIndex === index++);

        this.setState(
            {
                errorsRects: mapOfBboxes,
            },
            () => {
                if (autoSelect) {
                    preventScroll = true;
                    this.autoSelectRect();
                }
            }
        );
    }

    fillCanvasByPage(page) {
        const canvas = document.querySelector(`canvas[data-page="${page}"]`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        Object.keys(this.state.errorsRects).forEach(key => {
            if (this.state.errorsRects[key] instanceof Array) {
                return this.state.errorsRects[key].forEach(rect => {
                    if (rect.pageIndex !== page) return;
                    ctx.strokeRect(
                        rect.x * this.props.scale,
                        rect.y * this.props.scale,
                        rect.width * this.props.scale,
                        rect.height * this.props.scale
                    );
                });
            }
            if (this.state.errorsRects[key].pageIndex !== page) {
                return;
            }

            ctx.strokeStyle = COLOR.DEFAULT;
            ctx.strokeRect(
                this.state.errorsRects[key].x * this.props.scale,
                this.state.errorsRects[key].y * this.props.scale,
                this.state.errorsRects[key].width * this.props.scale,
                this.state.errorsRects[key].height * this.props.scale
            );
        });
    }

    // eslint-disable-next-line class-methods-use-this
    clearCanvasByPage(page) {
        const canvas = document.querySelector(`canvas[data-page="${page}"]`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    redrawCanvasByPage(page) {
        this.clearCanvasByPage(page);
        this.fillCanvasByPage(page);
    }

    selectRect(errorObject) {
        if (!errorObject) return;
        const rectsArr = errorObject instanceof Array ? errorObject : [errorObject];
        return rectsArr.forEach(rect => {
            const canvas = document.querySelector(`canvas[data-page="${rect.pageIndex}"]`);
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = COLOR.ACTIVE;
            ctx.strokeStyle = COLOR.HOVER;
            ctx.strokeRect(
                rect.x * this.props.scale,
                rect.y * this.props.scale,
                rect.width * this.props.scale,
                rect.height * this.props.scale
            );
            ctx.fillRect(
                rect.x * this.props.scale,
                rect.y * this.props.scale,
                rect.width * this.props.scale,
                rect.height * this.props.scale
            );
        });
    }

    waitRendering(pageNumber) {
        return new Promise(resolve => {
            const renderInterval = setInterval(() => {
                if (this.state.shownPages.includes(pageNumber)) {
                    clearInterval(renderInterval);
                    resolve();
                }
            }, 100);
        });
    }

    autoSelectRect() {
        if (this.props.selectedCheck) {
            const selectRect = () => {
                if (!preventScroll) {
                    //  auto scroll to page with selected error
                    const $documentArea = document.querySelector('.inspect-document');
                    const rect =
                        this.state.errorsRects[this.props.selectedCheck][0] ||
                        this.state.errorsRects[this.props.selectedCheck];
                    const $canvasPage = document.querySelector(`canvas[data-page="${rect.pageIndex}"]`);

                    if (!$canvasPage) return;

                    const { y, height } = rect;
                    if (y && height) {
                        const scrollDifference =
                            $canvasPage.offsetHeight - (y + height) * this.props.scale - $documentArea.offsetHeight / 3;
                        $canvasPage.scrollIntoView();
                        document.querySelector('.inspect-document').scrollTop += scrollDifference;
                    }
                } else {
                    preventScroll = false;
                }

                if (this.state.errorsRects[this.props.selectedCheck] instanceof Array) {
                    this.state.errorsRects[this.props.selectedCheck].forEach(rect => {
                        this.redrawCanvasByPage(rect.pageIndex);
                    });
                } else {
                    this.redrawCanvasByPage(this.state.errorsRects[this.props.selectedCheck].pageIndex);
                }
                this.selectRect(this.state.errorsRects[this.props.selectedCheck]);
            };

            if (!this.state.errorsRects[this.props.selectedCheck]) {
                const pageNumber = this.state.mapOfErrors[this.props.selectedCheck].pageIndex + 1; // increased by 1 because object store indices
                if (pageNumber > 0) {
                    document.querySelector(`.pdf-page[data-page="${pageNumber}"]`).scrollIntoView();

                    this.waitRendering().then(() => {
                        selectRect();
                    });
                }
            } else {
                selectRect();
            }
        }
    }

    findBboxCoords({ listOfMcid, pageIndex, location }) {
        let coords = null;
        if (location) {
            const bboxes = calculateBboxFromLocation(location);
            return bboxes.map(bbox => {
                return {
                    pageIndex: bbox.page,
                    x: bbox.location[0],
                    y: bbox.location[1],
                    width: bbox.location[2],
                    height: bbox.location[3],
                };
            });
        }

        if (listOfMcid instanceof Array) {
            listOfMcid.forEach(mcid => {
                const currentBbox = this.state.bboxByPage[pageIndex][mcid];
                if (
                    !_.isNil(currentBbox) &&
                    !_.isNaN(currentBbox.x) &&
                    !_.isNaN(currentBbox.y) &&
                    !_.isNaN(currentBbox.width) &&
                    !_.isNaN(currentBbox.height)
                ) {
                    coords = concatBoundingBoxes(currentBbox, coords);
                }
            });
        } else if (listOfMcid.hasOwnProperty('annot')) {
            const rect = this.state.annotationsByPage[pageIndex][listOfMcid.annot].rect;
            coords = {
                x: rect[0],
                y: rect[1],
                width: Math.abs(rect[0] - rect[2]),
                height: Math.abs(rect[1] - rect[3]),
            };
        }

        return { ...coords, pageIndex };
    }

    render() {
        const { canvasPages, error, pagesMap } = this.state;
        return (
            <section className="inspect-document" onScroll={this.onDocumentScroll}>
                <section className="pdf-wrapper">
                    <Document
                        file={this.props.file}
                        onLoadSuccess={this.onDocumentLoadSuccess}
                        options={{
                            cMapUrl: `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/cmaps/`,
                            cMapPacked: true,
                        }}
                        onLoadError={e => this.onError(e)}
                        error={<div className="error-msg">{error}</div>}
                    >
                        {Object.values(pagesMap)}
                        <section key="pdf-overlay" id="container">
                            {Object.values(canvasPages)}
                        </section>
                    </Document>
                </section>
            </section>
        );
    }
}

const SummaryInterface = PropTypes.shape({
    clause: PropTypes.string.isRequired,
    testNumber: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    checks: PropTypes.arrayOf(PropTypes.object).isRequired,
});

PdfDocument.propTypes = {
    file: PropTypes.object.isRequired,
    ruleSummaries: PropTypes.arrayOf(SummaryInterface).isRequired,
    selectedCheck: PropTypes.string,
    scale: PropTypes.string.isRequired,
    setSelectedCheck: PropTypes.func.isRequired,
    setPdfName: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        file: getPdfFiles(state)[0],
        ruleSummaries: getRuleSummaries(state),
    };
}

export default connect(mapStateToProps)(PdfDocument);
