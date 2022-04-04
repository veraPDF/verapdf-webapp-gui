import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { DROPZONE_OPTIONS } from '../../../../../services/constants';

import './DropzoneWrapper.scss';

const DROPZONE_TEXT = 'Drop a PDF file';

function DropzoneWrapper(props) {
    const { onFileDrop, children } = props;

    // NOTE: will be adjusted with multiple files in future
    const onDrop = useCallback(
        acceptedFiles => {
            if (!acceptedFiles.length) return;

            onFileDrop(acceptedFiles);
        },
        [onFileDrop]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        ...DROPZONE_OPTIONS,
        noClick: true,
    });

    return (
        <section
            {...getRootProps({
                className: 'dropzone-wrapper',
            })}
        >
            {children}
            <input {...getInputProps()} />
            <div
                className={classNames('dropzone-wrapper__fade', {
                    _visible: isDragActive,
                })}
            >
                {DROPZONE_TEXT}
            </div>
        </section>
    );
}

DropzoneWrapper.propTypes = {
    onFileDrop: PropTypes.func.isRequired,
};

export default DropzoneWrapper;
