import React from 'react';
import logo from './veraPDF-logo-400.png';
import './Header.scss';

function Header() {
    return (
        <header className="app-header">
            <section className="app-header--left">
                <img src={logo} className="app-header-logo" alt="logo" />
            </section>
        </header>
    );
}

export default Header;
