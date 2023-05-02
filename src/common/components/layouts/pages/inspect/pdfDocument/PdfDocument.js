import React, { KeyboardEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PdfViewer from 'verapdf-js-viewer';
import _ from 'lodash';
import { getPdfFiles } from '../../../../../store/pdfFiles/selectors';
import { getRuleSummaries } from '../../../../../store/job/result/selectors';
import { convertContextToPath, findAllMcid, getCheckId } from '../../../../../services/pdfService';
import { getPage, isFileUploadMode } from '../../../../../store/application/selectors';
import { setNumPages, setPage } from '../../../../../store/application/actions';
import { getTaskFileId } from '../../../../../store/job/selectors';
import { getFileLinkById } from '../../../../../services/fileService';

import Alert from '@material-ui/lab/Alert';
import Close from '@material-ui/icons/Close';

import './PdfDocument.scss';
import { getItem } from '../../../../../services/localStorageService';
import { LS_ERROR_MESSAGES_LANGUAGE } from '../../../../../store/constants';
import { getProfile } from '../../../../../store/job/settings/selectors';
import { errorMessagesMap, errorProfiles, languageEnum } from '../tree/Tree';

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
    errorMessages: PropTypes.object,
    selectedCheck: PropTypes.string,
    scale: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    setSelectedCheck: PropTypes.func.isRequired,
    setPdfName: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    setNumPages: PropTypes.func.isRequired,
    onWarning: PropTypes.func,
    warningMessage: PropTypes.string,
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
    const bboxes = useMemo(() => {
        return Object.values(mapOfErrors).map(({ pageIndex, location, groupId, bboxTitle }) => ({
            location,
            groupId,
            bboxTitle,
        }));
    }, [mapOfErrors]);
    const [language] = useState(getItem(LS_ERROR_MESSAGES_LANGUAGE) || languageEnum.English);

    useEffect(() => {
        setActiveBboxIndex(Object.keys(mapOfErrors).indexOf(props.selectedCheck));
        if (!props.selectedCheck?.includes('bbox')) {
            const pageIndex = mapOfErrors[props.selectedCheck]?.pageIndex;
            pageIndex > -1 && props.onPageChange(pageIndex + 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapOfErrors, props.selectedCheck]);
    useEffect(() => {
        props.setSelectedCheck(Object.keys(mapOfErrors)[activeBboxIndex]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapOfErrors, activeBboxIndex, props.setSelectedCheck]);
    useEffect(() => {
        if (!props.file) {
            window.location.replace(PUBLIC_URL);
        }
    }, [props.file]);

    function getTitleDescription({ specification, clause, testNumber }, errorMessages) {
        return (
            errorMessages?.[specification]?.[clause]?.[testNumber]?.SUMMARY ||
            `${specification}, clause ${clause}, test ${testNumber}`
        );
    }

    const errorMessages = useMemo(() => {
        switch (props.profile) {
            case errorProfiles.TAGGED_PDF:
                return errorMessagesMap[props.profile][language];
            default:
                return errorMessagesMap[errorProfiles.OTHER][language];
        }
    }, [language, props.profile]);

    const onDocumentReady = useCallback(
        document => {
            props.setPdfName(props.file.name);
            props.setNumPages(document.numPages);
            let newMapOfErrors = {};
            let allChecks = [];
            const structureTree = document._pdfInfo.structureTree;
            if (!_.isNil(props.ruleSummaries) && !_.isNil(structureTree)) {
                props.ruleSummaries.forEach((summary, index) => {
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
                        };
                    });
                });
            }
            newMapOfErrors = _.orderBy(newMapOfErrors, ['pageIndex'], ['asc']);
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

    const onSelectBboxByKeyboard = useCallback(data => setActiveBboxIndex(data), []);

    return (
        <div className="pdf-viewer__wrapper" role="button" tabIndex={0}>
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
                onBboxClick={data => onBboxSelect(data)}
                onSelectBbox={data => onSelectBboxByKeyboard(data)}
                bboxes={bboxes}
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
        file: isFileUploadMode(state) ? getPdfFiles(state)[0] : getFileLinkById(getTaskFileId(state)),
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
