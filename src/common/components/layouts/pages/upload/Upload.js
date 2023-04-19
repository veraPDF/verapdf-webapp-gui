import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Box from '@material-ui/core/Box';
import { hasFilesAttached } from '../../../../store/pdfFiles/selectors';
import { connect } from 'react-redux';
import AppPages from '../../../AppPages';
import Dropzone from './dropzone/Dropzone';
import Inputzone from './inputzone/Inputzone';
import WizardStep from '../../wizardStep/WizardStep';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import { setLink } from '../../../../store/pdfLink/actions';
import { getFileLink, getFileError } from '../../../../store/pdfLink/selectors';
import { isFileUploadMode } from '../../../../store/application/selectors';
import { setFileUploadMode } from '../../../../store/application/actions';

import './Upload.scss';

const ZONES = ['upload from computer', 'upload from web'];

function Upload({ filesAttached, link, error, isFileUploadMode, setFileUploadMode }) {
    const selectedZone = useMemo(() => ZONES[isFileUploadMode ? 0 : 1], [isFileUploadMode]);
    const forwardButtonDrop = useMemo(
        () => ({
            label: 'Configure job',
            to: AppPages.SETTINGS,
            disabled: !filesAttached,
        }),
        [filesAttached]
    );
    const forwardButtonInput = useMemo(
        () => ({
            label: 'Configure job',
            to: AppPages.SETTINGS,
            disabled: error,
        }),
        [error]
    );
    const buttons = useMemo(() => {
        return ZONES.map(zone => (
            <ToggleButton key={zone} value={zone}>
                {zone}
            </ToggleButton>
        ));
    }, []);
    useEffect(() => {
        if (!error) setLink(link);
    }, [link, error]);
    const handleZone = (_event, zone) => {
        zone !== null && setFileUploadMode(zone === ZONES[0]);
    };
    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <div className="upload">
                <Box display="flex" justifyContent="center">
                    <ToggleButtonGroup size="small" value={selectedZone} exclusive onChange={handleZone}>
                        {buttons}
                    </ToggleButtonGroup>
                </Box>
            </div>
            {selectedZone === ZONES[0] ? <Dropzone /> : <Inputzone />}
            <PageNavigation forward={selectedZone === ZONES[0] ? forwardButtonDrop : forwardButtonInput} />
        </WizardStep>
    );
}

Upload.propTypes = {
    filesAttached: PropTypes.bool.isRequired,
    link: PropTypes.string.isRequired,
    error: PropTypes.bool.isRequired,
    isFileUploadMode: PropTypes.bool.isRequired,
    setFileUploadMode: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        filesAttached: hasFilesAttached(state),
        link: getFileLink(state),
        error: getFileError(state),
        isFileUploadMode: isFileUploadMode(state),
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setFileUploadMode: fileUploadMode => dispatch(setFileUploadMode(fileUploadMode)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
