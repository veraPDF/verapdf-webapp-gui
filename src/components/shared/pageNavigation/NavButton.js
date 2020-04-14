import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '../button/Button';

const TYPE = {
    BACK: 'back',
    FORWARD: 'forward',
};
const VARIANTS = {
    [TYPE.BACK]: 'outlined',
    [TYPE.FORWARD]: 'contained',
};

function NavButton(props) {
    const { to, disabled, type } = props;

    return (
        <Link
            to={to}
            className={classNames('app-link nav-button', `nav-button_${type}`, { 'app-link_disabled': disabled })}
        >
            <Button variant={VARIANTS[type]} color="primary" disabled={disabled}>
                {props.children}
            </Button>
        </Link>
    );
}

NavButton.propTypes = {
    to: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

export default NavButton;
