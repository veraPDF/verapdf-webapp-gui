import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import _ from 'lodash';

import AppPages from '../../AppPages';
import { getUseSettings } from '../../../store/application/selectors';
import MaterialStepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepIcon from './StepIcon';

import './Stepper.scss';

const STEPS = [
    {
        key: AppPages.UPLOAD,
        label: 'Upload PDF',
    },
    {
        key: AppPages.SETTINGS,
        label: 'Configuration',
    },
    {
        key: AppPages.STATUS.route,
        label: 'Validation',
    },
    {
        key: AppPages.RESULTS.route,
        label: 'Results',
    },
];

function Stepper({ activeStep, customizeConfig }) {
    const steps = useMemo(() => (customizeConfig ? STEPS : _.reject(STEPS, { key: AppPages.SETTINGS })), [
        customizeConfig,
    ]);
    const activeIndex = useMemo(() => _.findIndex(steps, { key: activeStep }), [steps, activeStep]);

    return (
        <>
            <MaterialStepper
                className={classNames('stepper', { 'with-config': customizeConfig })}
                activeStep={activeIndex}
                alternativeLabel
            >
                {steps.map(({ label }) => (
                    <Step key={label}>
                        <StepLabel StepIconComponent={StepIcon}>{label}</StepLabel>
                    </Step>
                ))}
            </MaterialStepper>
            <h1 className="active-step">{steps[activeIndex].label}</h1>
        </>
    );
}

Stepper.propTypes = {
    activeStep: PropTypes.string.isRequired,
    customizeConfig: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        customizeConfig: getUseSettings(state), // TODO: rename selector/reducer
    };
};

export default connect(mapStateToProps)(Stepper);
