import React from 'react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { connect } from 'react-redux';

import Button from '../button/Button';
import { reset } from '../../../store/application/actions';

function ResetButton({ component = Button, onResetClick, ...props }) {
    const history = useHistory();
    const onClick = useCallback(() => onResetClick(history), [history, onResetClick]);
    return React.createElement(component, { ...props, onClick });
}

function mapDispatchToProps(dispatch) {
    return {
        onResetClick: history => dispatch(reset(history)),
    };
}

export default connect(null, mapDispatchToProps)(ResetButton);
