import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';

import AppPages from '../../AppPages';
import { getUseSettings } from '../../../store/application/selectors';
import MaterialStepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepIcon from './StepIcon';

import './Stepper.scss';

function Stepper({ activeStep, useSettings }) {
    const STEPS = useMemo(
        () => [
            {
                key: AppPages.UPLOAD,
                label: 'Upload PDF',
            },
            {
                key: AppPages.SETTINGS,
                label: 'Select settings',
                skip: !useSettings,
            },
            {
                key: AppPages.STATUS.route,
                label: 'Validation',
            },
            {
                key: AppPages.RESULTS.route,
                label: 'Verification results',
            },
        ],
        [useSettings]
    );
    const activeIndex = useMemo(
        () =>
            _.findIndex(
                STEPS.filter(step => !step.skip),
                { key: activeStep }
            ),
        [STEPS, activeStep]
    );

    return (
        <MaterialStepper className="stepper" activeStep={activeIndex} alternativeLabel>
            {STEPS.filter(step => !step.skip).map(({ label }) => (
                <Step key={label}>
                    <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                </Step>
            ))}
        </MaterialStepper>
    );
}

Stepper.propTypes = {
    activeStep: PropTypes.string.isRequired,
    useSettings: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        useSettings: getUseSettings(state),
    };
};

export default connect(mapStateToProps)(Stepper);
