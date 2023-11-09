import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '../button/Button';

function NavButton(props) {
    const { to, disabled, type, variant, onClick } = props;

    return (
        <Link
            to={to}
            className={classNames('app-link nav-button', `nav-button_${type}`, { 'app-link_disabled': disabled })}
        >
            <Button variant={variant} color="primary" disabled={disabled} onClick={onClick}>
                {props.children}
            </Button>
        </Link>
    );
}

NavButton.propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]).isRequired,
    type: PropTypes.string.isRequired,
    variant: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
};

export default NavButton;
