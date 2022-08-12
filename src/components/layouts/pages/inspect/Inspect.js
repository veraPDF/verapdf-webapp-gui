import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { lockApp, resetOnFileUpload, unlockApp } from '../../../../store/application/actions';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import Toolbar from './toolbar/Toolbar';
import Tree from './tree/Tree';
import PdfDocument from './pdfDocument/PdfDocument';
import DropzoneWrapper from '../upload/dropzoneWrapper/DropzoneWrapper';

import './Inspect.scss';

const { PUBLIC_URL } = process.env;
pdfjs.GlobalWorkerOptions.workerSrc = `${PUBLIC_URL}/pdf.worker.js`;

function Inspect({ jobStatus, taskStatus, lockApp, unlockApp, onFileDrop }) {
    const { id: jobId } = useParams();
    const [pdfName, setPdfName] = useState('');
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [errorsMap, setErrorsMap] = useState({});
    const [scale, setScale] = useState('1');
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

    useEffect(() => {
        lockApp();
    }, [lockApp]);

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <DropzoneWrapper onFileDrop={onDrop}>
            <section className="inspect">
                <Toolbar name={pdfName} scale={scale} scaleOptions={scaleOptions} onScaleChanged={setScale} />
                <Tree selectedCheck={selectedCheck} setSelectedCheck={setSelectedCheck} errorsMap={errorsMap} />
                <PdfDocument
                    selectedCheck={selectedCheck}
                    setSelectedCheck={setSelectedCheck}
                    setPdfName={setPdfName}
                    onDocumentReady={onDocumentReady}
                    scale={scale}
                />
            </section>
        </DropzoneWrapper>
    );
}

Inspect.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    lockApp: PropTypes.func.isRequired,
    unlockApp: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
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
