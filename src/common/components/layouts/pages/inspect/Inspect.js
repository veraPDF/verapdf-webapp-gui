import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import classNames from 'classnames';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { WARNING_MESSAGES } from '../../../../services/constants';
import {
    parseTree,
    cleanTree,
    setTreeIds,
    getTreeRoleNames,
    getTreeIds,
    setRulesTreeIds,
} from '../../../../services/treeService';
import { lockApp, resetOnFileUpload, unlockApp } from '../../../../store/application/actions';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import { getRuleSummaries } from '../../../../store/job/result/selectors';
import Toolbar from './toolbar/Toolbar';
import Tree from './tree/Tree';
import PdfDocument from './pdfDocument/PdfDocument';
import Structure from './structure/Structure';
import DropzoneWrapper from '../upload/dropzoneWrapper/DropzoneWrapper';

import './Inspect.scss';

const UNSELECTED = -1;

function Inspect({ jobStatus, taskStatus, ruleSummaries, lockApp, unlockApp, onFileDrop }) {
    const { id: jobId } = useParams();
    const [pdfName, setPdfName] = useState('');
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [expandedRules, setExpandedRules] = useState(new Array(ruleSummaries.length).fill(UNSELECTED));
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [warningMessage, setWarningMessage] = useState(null);
    const [errorsMap, setErrorsMap] = useState({});
    const [scale, setScale] = useState('1');
    const [isTreeShow, setIsTreeShow] = useState(false);
    const [treeData, setTreeData] = useState({});
    const [roleMap, setRoleMap] = useState(false);
    const scaleOptions = [
        { label: '50%', value: '0.5' },
        { label: '75%', value: '0.75' },
        { label: '100%', value: '1' },
        { label: '150%', value: '1.5' },
        { label: '200%', value: '2' },
        { label: '250%', value: '2.5' },
        { label: '300%', value: '3' },
    ];
    const onDocumentReady = useCallback(
        eMap => {
            setErrorsMap(eMap);
            unlockApp();
        },
        [unlockApp]
    );
    const onDrop = useCallback(
        acceptedFiles => {
            onFileDrop(acceptedFiles[0]);
        },
        [onFileDrop]
    );
    const onWarning = useCallback(warningCode => {
        setWarningMessage(WARNING_MESSAGES[warningCode]);
    }, []);
    const onExpandRule = useCallback(
        (index, closeIfExists = true) => {
            const copyExpandedRule = _.clone(expandedRules);
            expandedRules.includes(index) && closeIfExists
                ? copyExpandedRule.splice(index, 1, UNSELECTED)
                : copyExpandedRule.splice(index, 1, index);
            return setExpandedRules(copyExpandedRule);
        },
        [expandedRules, setExpandedRules]
    );
    const initTree = useCallback(
        tree => {
            const ruleSummariesWithTreeIds = setRulesTreeIds(ruleSummaries);
            const parsedTree = parseTree(tree);
            const cleanedTree = cleanTree(parsedTree);
            const treeWithIds = setTreeIds(cleanedTree);
            const treeWithRoleNames = getTreeRoleNames(treeWithIds, ruleSummariesWithTreeIds);
            const ids = getTreeIds(treeWithIds);
            setTreeData({ tree: treeWithRoleNames, ids: ids, ruleSummaries: ruleSummariesWithTreeIds });
        },
        [ruleSummaries]
    );

    useEffect(() => {
        warningMessage && setWarningMessage(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCheck]);
    useEffect(() => {
        lockApp();
    }, [lockApp]);
    useEffect(() => {
        if (!_.isNil(treeData.ids)) {
            const objExpandedNodes = _.fromPairs(_.entries(treeData.ids).map(([_, value]) => [value, true]));
            setExpandedNodes(objExpandedNodes);
        }
    }, [treeData]);

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <DropzoneWrapper onFileDrop={onDrop}>
            <section
                className={classNames('inspect', {
                    showStructure: isTreeShow,
                })}
            >
                <Toolbar name={pdfName} scale={scale} scaleOptions={scaleOptions} onScaleChanged={setScale} />
                <Tree
                    selectedCheck={selectedCheck}
                    setSelectedCheck={setSelectedCheck}
                    expandedRules={expandedRules}
                    onExpandRule={onExpandRule}
                    errorsMap={errorsMap}
                />
                <PdfDocument
                    selectedCheck={selectedCheck}
                    setSelectedCheck={setSelectedCheck}
                    expandedRules={expandedRules}
                    setPdfName={setPdfName}
                    onWarning={onWarning}
                    warningMessage={warningMessage}
                    onDocumentReady={onDocumentReady}
                    onExpandRule={onExpandRule}
                    initTree={initTree}
                    scale={scale}
                />
                <Structure
                    tree={treeData.tree}
                    isTreeShow={isTreeShow}
                    setIsTreeShow={setIsTreeShow}
                    selectedCheck={selectedCheck}
                    setSelectedCheck={setSelectedCheck}
                    expandedNodes={expandedNodes}
                    setExpandedNodes={setExpandedNodes}
                    roleMap={roleMap}
                    setRoleMap={setRoleMap}
                    ruleSummaries={treeData.ruleSummaries}
                    errorsMap={errorsMap}
                />
            </section>
        </DropzoneWrapper>
    );
}

const SummaryInterface = PropTypes.shape({
    clause: PropTypes.string.isRequired,
    testNumber: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    checks: PropTypes.arrayOf(PropTypes.object).isRequired,
});

Inspect.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    ruleSummaries: PropTypes.arrayOf(SummaryInterface).isRequired,
    lockApp: PropTypes.func.isRequired,
    unlockApp: PropTypes.func.isRequired,
    onFileDrop: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
        ruleSummaries: getRuleSummaries(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        lockApp: () => dispatch(lockApp()),
        unlockApp: () => dispatch(unlockApp()),
        onFileDrop: file => dispatch(resetOnFileUpload(file)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inspect);
