import React from 'react';
import PropTypes from 'prop-types';
import './DropzoneText.scss';

const DROPZONE_TEXT = 'Drop a PDF file, or click to select a file';

function DropzoneText(props) {
    const { files } = props;

    return (
        <section className="dropzone-text">
            {files.length ? (
                <>
                    {files[0].name}
                    <span className="dropzone-text__file-size"> - {formatFileSize(files[0])}</span>
                </>
            ) : (
                DROPZONE_TEXT
            )}
        </section>
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
