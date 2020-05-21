import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Document, Page, pdfjs } from 'react-pdf';

import { getPdfFiles } from '../../../../store/pdfFiles/selectors';

import './Inspect.scss';

const { PUBLIC_URL } = process.env;
pdfjs.GlobalWorkerOptions.workerSrc = `${PUBLIC_URL}/pdf.worker.js`;

function Inspect(props) {
    const { file } = props;

    const [pageNumber] = useState(1);

    const onDocumentLoadSuccess = document => {
        console.log('Structure tree: ', document._pdfInfo.structureTree);
    };
    const onPageLoadSuccess = page => {
        page.getOperatorList().then(data => {
            console.log('Bboxes: ', data.argsArray[data.argsArray.length - 1]);
        });
    };

    return (
        <section className="inspect">
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                <Page pageNumber={pageNumber} onLoadSuccess={onPageLoadSuccess} />
            </Document>
        </section>
    );
}

Inspect.propTypes = {
    file: PropTypes.object,
};

const mapStateToProps = state => {
    return {
        file: getPdfFiles(state)[0],
    };
};

export default connect(mapStateToProps)(Inspect);
