import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CircularProgress from '@material-ui/core/CircularProgress';
import { isLocked } from '../../../store/application/selectors';

import './LockOverlay.scss';

function LockOverlay({ locked }) {
    return (
        locked && (
            <section className="lock">
                <CircularProgress />
            </section>
        )
    );
}

LockOverlay.propTypes = {
    locked: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        locked: isLocked(state),
    };
}

export default connect(mapStateToProps)(LockOverlay);
