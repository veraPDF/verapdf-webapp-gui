import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Footer.scss';

function Footer(props) {
    const { appVersion } = props;
    return (
        <footer className="app-footer">
            <div>version: {appVersion}</div>
        </footer>
    );
}

Footer.propTypes = {
    appVersion: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
    return {
        appVersion: state.serverInfo.version,
    };
}

export default connect(mapStateToProps, {})(React.memo(Footer));
