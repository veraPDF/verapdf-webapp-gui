import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Document, Page, pdfjs } from 'react-pdf';

import { getPdfFiles } from '../../../../store/pdfFiles/selectors';

import './Inspect.scss';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function Inspect(props) {
    const { file } = props;

    const [pageNumber] = useState(1);

    return (
        <section className="inspect">
            <Document file={file}>
                <Page pageNumber={pageNumber} />
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
