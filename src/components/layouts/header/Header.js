import React from 'react';
import { Link } from 'react-router-dom';
import { Link as MaterialLink } from '@material-ui/core';
import HelpOutline from '@material-ui/icons/HelpOutline';

import ResetButton from '../../shared/resetButton/ResetButton';
import AppPages from '../../AppPages';
import logo from './veraPDF-logo-400.png';
import './Header.scss';

function Header() {
    return (
        <header className="app-header">
            <section className="app-header__left">
                <ResetButton component={MaterialLink} className="app-header-logo">
                    <img src={logo} className="app-header-logo" alt="logo" />
                </ResetButton>
            </section>
            <section className="app-header__right">
                <Link to={AppPages.ABOUT} className="app-link about-link">
                    <HelpOutline />
                </Link>
            </section>
        </header>
    );
}

export default Header;
