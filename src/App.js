import React from 'react';
import { connect } from 'react-redux';

function App(props) {
    const { serverInfo } = props;
    return <div className="vera-pdf-app app-container ">Version: {serverInfo.version}</div>;
}

function mapStateToProps(state) {
    return {
        serverInfo: state.serverInfo,
    };
}

export default connect(mapStateToProps, {})(App);
