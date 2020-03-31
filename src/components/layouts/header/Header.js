import React from 'react';
import { Link } from 'react-router-dom';
import HelpOutline from '@material-ui/icons/HelpOutline';
import logo from './veraPDF-logo-400.png';
import './Header.scss';

const ABOUT = '/about';

function Header() {
    return (
        <header className="app-header">
            <section className="app-header__left">
                <Link to="/" className="app-header-logo">
                    <img src={logo} className="app-header-logo" alt="logo" />
                </Link>
            </section>
            <section className="app-header__right">
                <Link to={ABOUT} className="app-link about-link">
                    <HelpOutline />
                </Link>
            </section>
        </header>
    );
}

export default Header;
