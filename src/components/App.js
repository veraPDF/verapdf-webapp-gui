import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import AppRouter from './AppRouter';
import Header from './layouts/header/Header';
import Footer from './layouts/footer/Footer';
import Loading from './layouts/pages/loading/Loading';
import { isInitialized } from '../store/application/selectors';
import './App.scss';

function App({ initialized }) {
    if (!initialized) {
        return <Loading />;
    }

    return (
        <div className="vera-pdf-app app-container">
            <Header />
            <main className="app-content">
                <AppRouter />
            </main>
            <Footer />
        </div>
    );
}

App.propTypes = {
    initialized: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    return {
        initialized: isInitialized(state),
    };
}

export default connect(mapStateToProps)(App);
