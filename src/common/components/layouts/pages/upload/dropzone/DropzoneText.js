import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from '@material-ui/core';

import './DropzoneText.scss';

const DROPZONE_TEXT = 'Drop a PDF file, or click to select a file';

function DropzoneText(props) {
    const { files } = props;

    return (
        <>
            {files.length ? (
                <>
                    <Tooltip title={files.length ? `${files[0].name}` : ''}>
                        <section className="dropzone-text">{files[0].name}</section>
                    </Tooltip>
                    <section className="dropzone-file-size">
                        <span>&nbsp;- {formatFileSize(files[0])}</span>
                    </section>
                </>
            ) : (
                <section className="dropzone-text">{DROPZONE_TEXT}</section>
            )}
        </>
    );
}

DropzoneText.propTypes = {
    files: PropTypes.array.isRequired,
};

function formatFileSize(file) {
    const { size } = file;
    return size < 1024 * 1024 ? `${(size / 1024).toFixed(2)} KB` : `${(size / 1024 / 1024).toFixed(2)} MB`;
}

export default DropzoneText;
