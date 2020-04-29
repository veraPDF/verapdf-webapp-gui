import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import CheckCircle from '@material-ui/icons/CheckCircle';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';

function StepIcon(props) {
    const { active, completed } = props;

    let Icon = RadioButtonUncheckedIcon;
    if (active) {
        Icon = RadioButtonCheckedIcon;
    } else if (completed) {
        Icon = CheckCircle;
    }

    return <div className={classNames({ active, completed })}>{React.createElement(Icon)}</div>;
}

StepIcon.propTypes = {
    active: PropTypes.bool,
    completed: PropTypes.bool,
};

export default StepIcon;
