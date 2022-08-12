import React from 'react';
import PropTypes from 'prop-types';
import NavButton from './NavButton';
import Button from '../button/Button';
import './PageNavigation.scss';

const TYPE = {
    BACK: 'back',
    CENTER: 'center',
    FORWARD: 'forward',
};
const VARIANTS = {
    [TYPE.BACK]: 'outlined',
    [TYPE.CENTER]: 'contained',
    [TYPE.FORWARD]: 'contained',
};

function PageNavigation(props) {
    const { back, forward, center } = props;
    return (
        <nav className="page-navigation">
            <section className="page-navigation__start">{getButton(back, TYPE.BACK)}</section>
            <section className="page-navigation__center">{getButton(center, TYPE.CENTER)}</section>
            <section className="page-navigation__end">{getButton(forward, TYPE.FORWARD)}</section>
        </nav>
    );
}

function getButton(buttonObject, type) {
    if (buttonObject?.to) {
        return (
            <NavButton to={buttonObject.to} type={type} disabled={buttonObject.disabled} variant={VARIANTS[type]}>
                {buttonObject.label}
            </NavButton>
        );
    }

    if (buttonObject?.onClick) {
        return (
            <Button
                variant={VARIANTS[type]}
                color="primary"
                disabled={buttonObject.disabled}
                onClick={buttonObject.onClick}
            >
                {buttonObject.label}
            </Button>
        );
    }

    return null;
}

const ButtonInterface = PropTypes.shape({
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]),
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
});

PageNavigation.propTypes = {
    back: ButtonInterface,
    forward: ButtonInterface,
};

export default PageNavigation;
