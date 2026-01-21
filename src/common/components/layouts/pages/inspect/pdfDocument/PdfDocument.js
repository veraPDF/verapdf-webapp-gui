import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PdfViewer from 'verapdf-js-viewer';
import _ from 'lodash';

import { useDebouncedResizeObserver } from '../../../../../hooks/useDebouncedResizeObserver';
import { getFileName, getPdfFiles } from '../../../../../store/pdfFiles/selectors';
import { getRuleSummaries } from '../../../../../store/job/result/selectors';
import { convertContextToPath, findAllMcid, getCheckId } from '../../../../../services/pdfService';
import { findNearToOneIndexInSortArray } from '../../../../../services/treeService';
import { getPage, isFileUploadMode } from '../../../../../store/application/selectors';
import { setNumPages, setPage } from '../../../../../store/application/actions';
import { getItem } from '../../../../../services/localStorageService';
import { LS_ERROR_MESSAGES_LANGUAGE } from '../../../../../store/constants';
import { scaleAdvancedValues, scaleAutoValues } from '../constants';
import { getProfile } from '../../../../../store/job/settings/selectors';
import { getFileNameLink } from '../../../../../store/pdfLink/selectors';
import { errorMessagesMap, errorProfiles, languageEnum } from '../tree/Tree';

import Alert from '@material-ui/lab/Alert';
import Close from '@material-ui/icons/Close';

import './PdfDocument.scss';

const { PUBLIC_URL } = process.env;

const SummaryInterface = PropTypes.shape({
    clause: PropTypes.string.isRequired,
    testNumber: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    checks: PropTypes.arrayOf(PropTypes.object).isRequired,
});

PdfDocument.propTypes = {
    file: PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.object.isRequired]),
    ruleSummaries: PropTypes.arrayOf(SummaryInterface).isRequired,
    ruleSummariesFiltered: PropTypes.arrayOf(SummaryInterface).isRequired,
    errorMessages: PropTypes.object,
    selectedCheck: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    selectedNodeId: PropTypes.string,
    isTreeShow: PropTypes.bool.isRequired,
    expandedRules: PropTypes.arrayOf(PropTypes.number).isRequired,
    scale: PropTypes.string.isRequired,
    scaleMode: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    initTree: PropTypes.func.isRequired,
    setSelectedCheck: PropTypes.func.isRequired,
    setSelectedNodeId: PropTypes.func.isRequired,
    setScale: PropTypes.func.isRequired,
    setPdfName: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    setNumPages: PropTypes.func.isRequired,
    onWarning: PropTypes.func,
    warningMessage: PropTypes.string,
    onExpandRule: PropTypes.func.isRequired,
    profile: PropTypes.string.isRequired,
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
    } else if (selectedTag.hasOwnProperty('contentItems')) {
        return selectedTag.pageIndex;
    } else if (selectedTag.hasOwnProperty('pageNumber')) {
        return selectedTag.pageNumber;
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
                        child => !child?.hasOwnProperty('rect') && (!child || (!child.mcid && child.mcid !== 0))
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

function getTitleDescription({ specification, clause, testNumber }, errorMessages) {
    return (
        errorMessages?.[specification]?.[clause]?.[testNumber]?.SUMMARY ||
        `${specification}, clause ${clause}, test ${testNumber}`
    );
}

function PdfDocument(props) {
    const { ref, width: wrapperWidth, height: wrapperHeight } = useDebouncedResizeObserver(500);
    const [structureTree, setStructureTree] = useState({});
    const [mapOfErrors, setMapOfErrors] = useState({});
    const [indicesOfVisibleErrors, setIndicesOfVisibleErrors] = useState(null);
    const [activeBboxIndex, setActiveBboxIndex] = useState(null);
    const [language] = useState(getItem(LS_ERROR_MESSAGES_LANGUAGE) || languageEnum.English);

    const bboxes = useMemo(() => {
        return Object.values(mapOfErrors).map(({ location, groupId, bboxTitle }, index) => ({
            isVisible: indicesOfVisibleErrors.includes(index),
            location,
            groupId,
            bboxTitle,
        }));
    }, [mapOfErrors, indicesOfVisibleErrors]);

    const errorMessages = useMemo(() => {
        switch (props.profile) {
            case errorProfiles.TAGGED_PDF:
            case errorProfiles.PDFUA_2:
            case errorProfiles.PDFUA_2_TAGGED_PDF:
                return errorMessagesMap[props.profile][language];
            default:
                return errorMessagesMap[errorProfiles.OTHER][language];
        }
    }, [language, props.profile]);

    const createMapOfErrors = useCallback(
        (ruleSummaries, structureTree) => {
            let newMapOfErrors = {};
            let allChecks = [];
            if (!_.isNil(ruleSummaries) && !_.isNil(structureTree)) {
                ruleSummaries.forEach((summary, index) => {
                    if (_.isNil(summary)) return;
                    allChecks = [...allChecks, ...summary.checks];
                    let rule = {
                        specification: summary.specification,
                        clause: summary.clause,
                        testNumber: summary.testNumber,
                    };

                    summary.checks.forEach((check, checkIndex) => {
                        let bboxTitle = '';
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
                        if (check && check.status === 'failed') {
                            bboxTitle = getTitleDescription(rule, errorMessages);
                        }
                        const checkId = getCheckId(check);
                        newMapOfErrors[`${index}:${checkIndex}:${check.location || check.context}:${bboxTitle}}`] = {
                            pageIndex,
                            location: check.location || check.context,
                            groupId: checkId ? `${summary.clause}-${summary.testNumber}-${checkId}` : null,
                            bboxTitle: bboxTitle,
                            ruleIndex: index,
                            checkIndex: checkIndex,
                        };
                    });
                });
            }
            return _.orderBy(newMapOfErrors, ['pageIndex'], ['asc']);
        },
        [errorMessages]
    );

    const onDocumentReady = useCallback(
        document => {
            props.setPdfName(props.file.name || props.fileName);
            props.setNumPages(document.numPages);
            props.initTree(document.parsedTree);
            setStructureTree(document._pdfInfo.structureTree);
            const newMapOfErrors = createMapOfErrors(props.ruleSummaries, document._pdfInfo.structureTree);
            props.onDocumentReady(newMapOfErrors);
            setMapOfErrors({ ...newMapOfErrors });
        },
        [createMapOfErrors, props]
    );

    const onBboxSelect = useCallback(
        data => {
            if (!data) {
                setActiveBboxIndex(null);
                props.setSelectedNodeId(null);
                props.setSelectedCheck(null);
                return;
            }
            if (_.isNil(data.index)) {
                setActiveBboxIndex(null);
                props.setSelectedCheck(null);
                props.setSelectedNodeId(data.id);
                return;
            }
            props.setSelectedNodeId(data.id);
            setActiveBboxIndex(data.index);
        },
        [props]
    );

    const onSelectBboxByKeyboard = useCallback(data => setActiveBboxIndex(data), []);

    useEffect(() => {
        setActiveBboxIndex(props.selectedCheck);
        const pageIndex = mapOfErrors[props.selectedCheck]?.pageIndex;
        pageIndex > -1 && props.onPageChange(pageIndex + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapOfErrors, props.selectedCheck]);
    useEffect(() => {
        props.setSelectedCheck(activeBboxIndex);
        if (activeBboxIndex != null && mapOfErrors[activeBboxIndex]) {
            const ruleIndex = mapOfErrors[activeBboxIndex]?.ruleIndex;
            props.onExpandRule(ruleIndex, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapOfErrors, activeBboxIndex, props.setSelectedCheck]);
    useEffect(() => {
        if (!props.file) {
            window.location.replace(PUBLIC_URL);
        }
    }, [props.file]);
    useEffect(() => {
        const newMapOfVisibleErrors = createMapOfErrors(props.ruleSummariesFiltered, structureTree);
        const indicesOfVisibleBboxes = newMapOfVisibleErrors.map(({ checkIndex, ruleIndex }) => {
            return Object.values(mapOfErrors).findIndex(
                error => error.checkIndex === checkIndex && error.ruleIndex === ruleIndex
            );
        });
        setIndicesOfVisibleErrors(indicesOfVisibleBboxes);
    }, [createMapOfErrors, props.ruleSummariesFiltered, structureTree, mapOfErrors]);
    useEffect(() => {
        if (!scaleAdvancedValues.includes(props.scaleMode)) {
            return;
        }

        const pdfPage = document.querySelector('.pdf-page');

        if (!_.isNil(wrapperWidth) && !_.isNil(wrapperHeight) && !_.isNil(pdfPage)) {
            const { width: pageWidth, height: pageHeight } = pdfPage.getBoundingClientRect();
            let ratio;

            switch (props.scaleMode) {
                case scaleAdvancedValues[0]: {
                    ratio = Math.max(pageWidth / wrapperWidth, pageHeight / wrapperHeight);
                    break;
                }
                case scaleAdvancedValues[1]: {
                    ratio = pageWidth / wrapperWidth;
                    break;
                }
                default: {
                    ratio = 1;
                    break;
                }
            }

            props.setScale(prev => {
                const index = findNearToOneIndexInSortArray(scaleAutoValues.map(value => (ratio * value) / prev));
                return scaleAutoValues[index] ?? prev;
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.scaleMode, wrapperWidth, wrapperHeight]);

    return (
        <div ref={ref} className="pdf-viewer__wrapper" role="button" tabIndex={0}>
            {props.warningMessage && (
                <Alert severity="warning">
                    {props.warningMessage}
                    <Close onClick={() => props.onWarning(null)} />
                </Alert>
            )}
            <PdfViewer
                file={props.file}
                scale={parseFloat(props.scale)}
                showAllPages
                externalLinkTarget="_blank"
                onLoadSuccess={onDocumentReady}
                activeBboxIndex={activeBboxIndex}
                activeBboxId={props.selectedNodeId}
                onBboxClick={data => onBboxSelect(data)}
                onSelectBbox={data => onSelectBboxByKeyboard(data)}
                bboxes={bboxes}
                treeBboxSelectionMode="SELECTED_WITH_KIDS"
                isTreeBboxesVisible={props.isTreeShow}
                page={props.page}
                ruleSummaries={props.ruleSummaries}
                onPageChange={props.onPageChange}
                onWarning={props.onWarning}
            />
        </div>
    );
}

function mapStateToProps(state) {
    return {
        file: getPdfFiles(state)[0],
        fileName: isFileUploadMode(state) ? getFileName(state) : getFileNameLink(state),
        ruleSummaries: getRuleSummaries(state),
        page: getPage(state),
        profile: getProfile(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        onPageChange: page => dispatch(setPage(page)),
        setNumPages: numPages => dispatch(setNumPages(numPages)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PdfDocument);
