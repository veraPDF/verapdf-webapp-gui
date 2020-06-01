import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { hasFilesAttached } from '../../../../store/pdfFiles/selectors';
import { connect } from 'react-redux';
import AppPages from '../../../AppPages';
import Dropzone from './dropzone/Dropzone';
import WizardStep from '../../wizardStep/WizardStep';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';

function Upload(props) {
    const { filesAttached } = props;
    const forwardButton = useMemo(
        () => ({
            label: 'Configure job',
            to: AppPages.SETTINGS,
            disabled: !filesAttached,
        }),
        [filesAttached]
    );

    return (
        <WizardStep stepIndex={AppPages.UPLOAD}>
            <Dropzone />
            <PageNavigation forward={forwardButton} />
        </WizardStep>
    );
}

Upload.propTypes = {
    filesAttached: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        filesAttached: hasFilesAttached(state),
    };
};

export default connect(mapStateToProps)(Upload);
