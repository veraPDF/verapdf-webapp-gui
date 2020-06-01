// Common layout for all pages, but not for Inspect
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Stepper from '../../shared/stepper/Stepper';

import './WizardStep.scss';

function WizardStep({ stepIndex, children, className }) {
    return (
        <section className={classNames('main-container', className)}>
            <Stepper activeStep={stepIndex} />
            {children}
        </section>
    );
}

WizardStep.propTypes = {
    stepIndex: PropTypes.string.isRequired,
};

export default WizardStep;
