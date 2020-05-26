import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { pdfjs } from 'react-pdf';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import Toolbar from './toolbar/Toolbar';
import Tree from './tree/Tree';
import PdfDocument from './pdfDocument/PdfDocument';

import './Inspect.scss';

const { PUBLIC_URL } = process.env;
pdfjs.GlobalWorkerOptions.workerSrc = `${PUBLIC_URL}/pdf.worker.js`;

function Inspect({ jobStatus, taskStatus }) {
    const { id: jobId } = useParams();
    const [pdfName, setPdfName] = useState('');
    const [selectedCheck, setSelectedCheck] = useState(null);

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <section className="inspect">
            <Toolbar name={pdfName} />
            <Tree selectedCheck={selectedCheck} setSelectedCheck={setSelectedCheck} />
            <PdfDocument selectedCheck={selectedCheck} setSelectedCheck={setSelectedCheck} setPdfName={setPdfName} />
        </section>
    );
}

Inspect.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
};

const mapStateToProps = state => {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
    };
};

export default connect(mapStateToProps)(Inspect);
