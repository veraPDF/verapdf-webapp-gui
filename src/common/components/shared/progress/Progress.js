import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import './Progress.scss';

function Progress({ variant, percents, title }) {
    return (
        <section className="progress" title={title}>
            <LinearProgress variant={variant} value={percents} color="secondary" className="progress__bar" />
            <span className="progress__percentage">{percents}%</span>
        </section>
    );
}

Progress.propTypes = {
    percents: PropTypes.number.isRequired,
    variant: PropTypes.string,
    title: PropTypes.string,
};

Progress.defaultProps = {
    variant: 'determinate',
};

export default Progress;
