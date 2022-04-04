import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { storeFile } from '../../../../../store/pdfFiles/actions';
import { getPdfFiles } from '../../../../../store/pdfFiles/selectors';
import { DROPZONE_OPTIONS } from '../../../../../services/constants';
import DropzoneText from './DropzoneText';

import './Dropzone.scss';

function Dropzone(props) {
    const { files, onFileDrop } = props;

    // NOTE: will be adjusted with multiple files in future
    const onDrop = useCallback(
        acceptedFiles => {
            if (!acceptedFiles.length) return;

            onFileDrop(acceptedFiles[0]);
        },
        [onFileDrop]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        ...DROPZONE_OPTIONS,
    });

    return (
        <section className="dropzone">
            <div
                {...getRootProps({
                    className: classNames('dropzone__container', {
                        _focused: isDragActive,
                        _filled: files.length,
                    }),
                })}
            >
                <input {...getInputProps()} />
                <DropzoneText files={files} />
            </div>
        </section>
    );
}

Dropzone.propTypes = {
    files: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
    onFileDrop: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        files: getPdfFiles(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onFileDrop: file => dispatch(storeFile(file)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dropzone);
