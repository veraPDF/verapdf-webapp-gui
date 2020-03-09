import React from 'react';
import Header from './layouts/header/Header';
import Footer from './layouts/footer/Footer';
import './App.scss';
import AppRouter from './AppRouter';

function App() {
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

export default App;
