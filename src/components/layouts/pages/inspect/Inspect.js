import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Redirect, useParams } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import _ from 'lodash';

import AppPages from '../../../AppPages';
import { JOB_STATUS, TASK_STATUS } from '../../../../store/constants';
import { getPdfFiles } from '../../../../store/pdfFiles/selectors';
import { getJobStatus, getTaskStatus } from '../../../../store/job/selectors';
import Toolbar from './toolbar/Toolbar';
import Tree from './tree/Tree';

import './Inspect.scss';

const { PUBLIC_URL } = process.env;
pdfjs.GlobalWorkerOptions.workerSrc = `${PUBLIC_URL}/pdf.worker.js`;

function Inspect({ file, jobStatus, taskStatus }) {
    const { id: jobId } = useParams();
    const [pdfName, setPdfName] = useState('');
    const [pageNumber] = useState(1);

    const onDocumentLoadSuccess = async document => {
        const { info } = await document.getMetadata();
        setPdfName(info.Title || file.name);
        console.log('Structure tree: ', document._pdfInfo.structureTree);
    };
    const onPageLoadSuccess = page => {
        page.getOperatorList().then(data => {
            console.log('Bboxes: ', data.argsArray[data.argsArray.length - 1]);
        });
    };

    if (jobStatus === JOB_STATUS.NOT_FOUND) {
        return <Redirect to={AppPages.NOT_FOUND} />;
    }
    if (jobStatus !== JOB_STATUS.FINISHED || taskStatus !== TASK_STATUS.FINISHED) {
        return <Redirect to={AppPages.STATUS.url(jobId)} />;
    }

    return (
        <section className="inspect">
            <Toolbar name={pdfName} />
            <Tree />
            <Document className="inspect__document" file={file} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} onLoadSuccess={onPageLoadSuccess} />
            </Document>
        </section>
    );
}

Inspect.propTypes = {
    jobStatus: PropTypes.oneOf(_.values(JOB_STATUS)).isRequired,
    taskStatus: PropTypes.oneOf(_.values(TASK_STATUS)),
    file: PropTypes.object,
};

const mapStateToProps = state => {
    return {
        jobStatus: getJobStatus(state),
        taskStatus: getTaskStatus(state),
        file: getPdfFiles(state)[0],
    };
};

export default connect(mapStateToProps)(Inspect);
