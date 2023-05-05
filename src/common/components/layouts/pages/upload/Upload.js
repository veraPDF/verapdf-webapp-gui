import React, { useMemo } from 'react';
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
import { storeLink, storeMode } from '../../../../store/pdfFiles/actions';

import './Upload.scss';

const ZONES = ['upload from computer', 'upload from web'];

function Upload({ filesAttached, link, error, isFileUploadMode, setFileUploadMode }) {
    const selectedZone = useMemo(() => ZONES[isFileUploadMode ? 0 : 1], [isFileUploadMode]);
    const forwardButton = useMemo(
        () => ({
            label: 'Configure job',
            to: AppPages.SETTINGS,
            disabled: isFileUploadMode ? !filesAttached : error,
            onClick: storeData(isFileUploadMode, link),
        }),
        [filesAttached, isFileUploadMode, link, error]
    );
    const buttons = useMemo(() => {
        return ZONES.map(zone => (
            <ToggleButton key={zone} value={zone}>
                {zone}
            </ToggleButton>
        ));
    }, []);
    const handleInput = () => {
        !error && setLink(link);
    };
    const handleZone = (_event, zone) => {
        zone !== null && setFileUploadMode(zone === ZONES[0]);
    };
    function storeData(mode, link) {
        storeMode(mode);
        storeLink(link);
    }
    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <div className="upload">
                <Box display="flex" justifyContent="center">
                    <ToggleButtonGroup size="small" value={selectedZone} exclusive onChange={handleZone}>
                        {buttons}
                    </ToggleButtonGroup>
                </Box>
            </div>
            {isFileUploadMode ? <Dropzone /> : <Inputzone onChange={handleInput} />}
            <PageNavigation forward={forwardButton} />
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
