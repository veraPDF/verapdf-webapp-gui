import React, { useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import PropTypes from 'prop-types';
import PdfViewer from 'verapdf-js-viewer';
import _ from 'lodash';

import { getPdfFiles } from '../../../../../store/pdfFiles/selectors';
import { getRuleSummaries } from '../../../../../store/job/result/selectors';
import { convertContextToPath, findAllMcid } from '../../../../../services/pdfService';
import { getPage } from '../../../../../store/application/selectors';
import { setNumPages, setPage } from '../../../../../store/application/actions';

import './PdfDocument.scss';

const SummaryInterface = PropTypes.shape({
    clause: PropTypes.string.isRequired,
    testNumber: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    checks: PropTypes.arrayOf(PropTypes.object).isRequired,
});

PdfDocument.propTypes = {
    file: PropTypes.object.isRequired,
    ruleSummaries: PropTypes.arrayOf(SummaryInterface).isRequired,
    selectedCheck: PropTypes.string,
    scale: PropTypes.string.isRequired,
    setSelectedCheck: PropTypes.func.isRequired,
    setPdfName: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    setNumPages: PropTypes.func.isRequired,
};

function getPageFromErrorPlace(context, structureTree) {
    const defaultValue = -1;
    let selectedTag = convertContextToPath(context);

    if (_.isEmpty(selectedTag)) {
        return defaultValue;
    }

    if (selectedTag.hasOwnProperty('mcid') && selectedTag.hasOwnProperty('pageIndex')) {
        return selectedTag.pageIndex;
    } else if (selectedTag.hasOwnProperty('annot') && selectedTag.hasOwnProperty('pageIndex')) {
        return selectedTag.pageIndex;
    } else if (selectedTag instanceof Array) {
        let objectOfErrors = { ...structureTree };
        selectedTag.forEach((node, index) => {
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
                if (objectOfErrors?.name === node[1] && index === 0) {
                    nextStepObject = objectOfErrors;
                } else {
                    const clearedChildren = objectOfErrors.children.filter(
                        child => !child || (!child.mcid && child.mcid !== 0)
                    );
                    nextStepObject = {
                        ...(clearedChildren.length ? clearedChildren : objectOfErrors.children)[node[0]],
                    };
                }
            }

            objectOfErrors = { ...nextStepObject };
        });
        const [, pageIndex] = findAllMcid(objectOfErrors);
        return pageIndex;
    }
    return defaultValue;
}

function PdfDocument(props) {
    const [mapOfErrors, setMapOfErrors] = useState({});
    const [activeBboxIndex, setActiveBboxIndex] = useState(null);
    useEffect(() => {
        setActiveBboxIndex(Object.keys(mapOfErrors).indexOf(props.selectedCheck));
    }, [mapOfErrors, props.selectedCheck]);
    useEffect(() => {
        props.setSelectedCheck(Object.keys(mapOfErrors)[activeBboxIndex]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapOfErrors, activeBboxIndex, props.setSelectedCheck]);

    const onDocumentReady = useCallback(
        document => {
            props.setPdfName(props.file.name);
            props.setNumPages(document.numPages);
            const newMapOfErrors = {};
            const structureTree = document._pdfInfo.structureTree;
            if (!_.isNil(props.ruleSummaries) && !_.isNil(structureTree)) {
                props.ruleSummaries.forEach((summary, index) => {
                    summary.checks.forEach((check, checkIndex) => {
                        let pageIndex = -1;
                        if (!check.location) {
                            pageIndex = getPageFromErrorPlace(check.context, structureTree);
                        } else {
                            if (check.location.includes('pages[')) {
                                pageIndex = parseInt(
                                    check.location
                                        .split('pages[')[1]
                                        .split(']')[0]
                                        .split('-')[0]
                                );
                            } else {
                                try {
                                    const bboxMap = JSON.parse(check.location);
                                    pageIndex = parseInt(bboxMap.bbox[0].p);
                                } catch (e) {
                                    console.error(`Not supported context: ${check.location}`);
                                    return;
                                }
                            }
                        }
                        newMapOfErrors[`${index}:${checkIndex}:${check.location || check.context}`] = {
                            pageIndex,
                            location: check.location || check.context,
                            groupId: check.errorArguments[2]
                                ? `${summary.clause}-${summary.testNumber}-${check.errorArguments[2]}`
                                : null,
                        };
                    });
                });
            }
            props.onDocumentReady(newMapOfErrors);
            setMapOfErrors({ ...newMapOfErrors });
        },
        [props]
    );

    const onBboxSelect = useCallback(
        data => {
            if (!data) {
                setActiveBboxIndex(null);
                props.setSelectedCheck(null);
                return;
            }
            setActiveBboxIndex(data.index);
        },
        [props]
    );
    return (
        <PdfViewer
            file={props.file}
            scale={parseFloat(props.scale)}
            showAllPages
            onLoadSuccess={onDocumentReady}
            activeBboxIndex={activeBboxIndex}
            onBboxClick={data => onBboxSelect(data)}
            bboxes={Object.values(mapOfErrors).map(({ pageIndex, location, groupId }) => ({
                location,
                groupId,
            }))}
            page={props.page}
            onPageChange={props.onPageChange}
        />
    );
}

function mapStateToProps(state) {
    return {
        file: getPdfFiles(state)[0],
        ruleSummaries: getRuleSummaries(state),
        page: getPage(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onPageChange: page => dispatch(setPage(page)),
        setNumPages: numPages => dispatch(setNumPages(numPages)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PdfDocument);
