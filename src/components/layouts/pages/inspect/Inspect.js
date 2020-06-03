import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { lockApp, unlockApp } from '../../../../store/application/actions';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import Toolbar from './toolbar/Toolbar';
import Tree from './tree/Tree';
import PdfDocument from './pdfDocument/PdfDocument';

import './Inspect.scss';

const { PUBLIC_URL } = process.env;
pdfjs.GlobalWorkerOptions.workerSrc = `${PUBLIC_URL}/pdf.worker.js`;

function Inspect({ jobStatus, taskStatus, lockApp, unlockApp }) {
    const { id: jobId } = useParams();
    const [pdfName, setPdfName] = useState('');
    const [selectedCheck, setSelectedCheck] = useState(null);
    const [errorsMap, setErrorsMap] = useState({});
    const onDocumentReady = useCallback(
        eMap => {
            setErrorsMap(eMap);
            unlockApp();
        },
        [unlockApp]
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
        <section className="inspect">
            <Toolbar name={pdfName} />
            <Tree selectedCheck={selectedCheck} setSelectedCheck={setSelectedCheck} errorsMap={errorsMap} />
            <PdfDocument
                selectedCheck={selectedCheck}
                setSelectedCheck={setSelectedCheck}
                setPdfName={setPdfName}
                onDocumentReady={onDocumentReady}
            />
        </section>
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
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inspect);
