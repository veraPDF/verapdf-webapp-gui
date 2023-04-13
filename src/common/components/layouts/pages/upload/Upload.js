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
import { uploadLinkAction } from '../../../../store/pdfLink/actions';
import { getFileLink, getFileError } from '../../../../store/pdfLink/selectors';
import { isTabFile } from '../../../../store/application/selectors';
import { setTabFile } from '../../../../store/application/actions';

const ZONES = ['upload from computer', 'upload from web'];

function Upload({ filesAttached, link, error, onLoadLink, isTabFile, setTabFile }) {
    const selectedZone = ZONES[isTabFile ? 0 : 1];
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
        if (!error) onLoadLink(link);
    }, [link, error, onLoadLink]);
    const handleZone = (_event, zone) => {
        setTabFile(zone === ZONES[0]);
    };
    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <div style={{ width: '100%', padding: '20px 0 40px' }}>
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
    isTabFile: PropTypes.bool.isRequired,
    onLoadLink: PropTypes.func.isRequired,
    setTabFile: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        filesAttached: hasFilesAttached(state),
        link: getFileLink(state),
        error: getFileError(state),
        isTabFile: isTabFile(state),
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onLoadLink: link => dispatch(uploadLinkAction(link)),
        setTabFile: tabFile => dispatch(setTabFile(tabFile)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
