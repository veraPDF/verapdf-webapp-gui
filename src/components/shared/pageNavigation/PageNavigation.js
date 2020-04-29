import React from 'react';
import PropTypes from 'prop-types';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import NavButton from './NavButton';
import './PageNavigation.scss';

function PageNavigation(props) {
    const { back, forward } = props;
    return (
        <nav className="page-navigation">
            <section className="page-navigation__start">
                {back && (
                    <NavButton to={back.link} type="back" disabled={back.disabled}>
                        <ArrowBackIcon /> {back.label}
                    </NavButton>
                )}
            </section>
            <section className="page-navigation__center" />
            <section className="page-navigation__end">
                {forward && (
                    <NavButton to={forward.link} type="forward" disabled={forward.disabled}>
                        {forward.label} <ArrowForwardIcon />
                    </NavButton>
                )}
            </section>
        </nav>
    );
}

const ButtonInterface = PropTypes.shape({
    link: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
});

PageNavigation.propTypes = {
    back: ButtonInterface,
    forward: ButtonInterface,
};

export default PageNavigation;
