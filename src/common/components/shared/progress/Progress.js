import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import './Progress.scss';

function Progress({ variant, percents, title, summary, progress }) {
    return (
        <section className="progress-section" title={title}>
            <div className="progress">
                <LinearProgress
                    variant={variant}
                    value={Math.min(percents, 100)}
                    color="secondary"
                    className="progress__bar"
                />
                <span className="progress__percentage">{summary}</span>
            </div>
            <p className="progress__message">{progress}</p>
        </section>
    );
}

Progress.propTypes = {
    percents: PropTypes.number.isRequired,
    variant: PropTypes.string,
    title: PropTypes.string,
    summary: PropTypes.string,
    progress: PropTypes.string,
};

Progress.defaultProps = {
    variant: 'determinate',
};

export default Progress;
