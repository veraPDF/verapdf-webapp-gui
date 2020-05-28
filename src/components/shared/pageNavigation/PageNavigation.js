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
            <section className="page-navigation__start">{getComponent(back, TYPE.BACK)}</section>
            <section className="page-navigation__center">{getComponent(center, TYPE.CENTER)}</section>
            <section className="page-navigation__end">{getComponent(forward, TYPE.FORWARD)}</section>
        </nav>
    );
}

function getComponent(componentObject, type) {
    if (React.isValidElement(componentObject)) {
        return componentObject;
    }

    if (componentObject?.to) {
        return (
            <NavButton to={componentObject.to} type={type} disabled={componentObject.disabled} variant={VARIANTS[type]}>
                {componentObject.label}
            </NavButton>
        );
    }

    if (componentObject?.onClick) {
        return (
            <Button
                variant={VARIANTS[type]}
                color="primary"
                disabled={componentObject.disabled}
                onClick={componentObject.onClick}
            >
                {componentObject.label}
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
    back: PropTypes.oneOfType([ButtonInterface, PropTypes.element]),
    forward: PropTypes.oneOfType([ButtonInterface, PropTypes.element]),
};

export default PageNavigation;
