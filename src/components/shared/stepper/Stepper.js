import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import MaterialStepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepIcon from './StepIcon';
import AppPages from '../../AppPages';
import './Stepper.scss';

const STEPS = [
    {
        key: AppPages.UPLOAD,
        label: 'Upload PDF',
    },
    {
        key: AppPages.SETTINGS,
        label: 'Select settings',
    },
    {
        key: AppPages.STATUS.route,
        label: 'Validation',
    },
    {
        key: AppPages.RESULTS.route,
        label: 'Verification results',
    },
];

function Stepper(props) {
    const { activeStep } = props;
    const activeIndex = useMemo(() => _.findIndex(STEPS, { key: activeStep }), [activeStep]);
    return (
        <MaterialStepper className="stepper" activeStep={activeIndex} alternativeLabel>
            {STEPS.map(({ label }) => (
                <Step key={label}>
                    <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                </Step>
            ))}
        </MaterialStepper>
    );
}

Stepper.propTypes = {
    activeStep: PropTypes.string.isRequired,
};

export default Stepper;
