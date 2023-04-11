import React, { useState, useEffect, useMemo } from 'react';
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
import { getPdfFiles } from '../../../../store/pdfFiles/selectors';

const zones = ['upload from computer', 'upload from web'];

function Upload({ filesAttached, link, error, onLoadLink, files }) {
    const [selectedZone, setSelectedZone] = useState(zones[0]);
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
            label: `Configure job ${error}`,
            to: AppPages.SETTINGS,
            disabled: error,
        }),
        [error]
    );
    useEffect(() => {
        if (!error) onLoadLink(link);
    }, [link, error, onLoadLink]);
    const handleZone = (event, zone) => {
        setSelectedZone(zone);
    };
    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <div style={{ width: '100%', padding: '20px 0 40px' }}>
                <Box display="flex" justifyContent="center">
                    <ToggleButtonGroup size="small" value={selectedZone} exclusive onChange={handleZone}>
                        {zones.map(zone => (
                            <ToggleButton key={zone} value={zone}>
                                {zone}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>
            </div>
            {selectedZone === zones[0] ? <Dropzone /> : <Inputzone />}
            <PageNavigation forward={selectedZone === zones[0] ? forwardButtonDrop : forwardButtonInput} />
        </WizardStep>
    );
}

Upload.propTypes = {
    filesAttached: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        filesAttached: hasFilesAttached(state),
        link: state.pdfLink.link,
        error: state.pdfLink.error,
        files: getPdfFiles(state),
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onLoadLink: link => dispatch(uploadLinkAction(link)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Upload);
