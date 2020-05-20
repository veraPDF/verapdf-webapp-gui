import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { hasFilesAttached } from '../../../../store/pdfFiles/selectors';
import { connect } from 'react-redux';
import AppPages from '../../../AppPages';
import Stepper from '../../../shared/stepper/Stepper';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import Dropzone from './dropzone/Dropzone';

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
        <section className="upload">
            <Stepper activeStep={AppPages.UPLOAD} />
            <Dropzone />
            <PageNavigation forward={forwardButton} />
        </section>
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
