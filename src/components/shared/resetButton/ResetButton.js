import React from 'react';
import { useCallback } from 'react';
import { connect } from 'react-redux';

import Button from '../button/Button';
import { reset } from '../../../store/application/actions';

function ResetButton({ component = Button, onResetClick, ...props }) {
    const onClick = useCallback(() => onResetClick(), [onResetClick]);
    return React.createElement(component, { ...props, onClick });
}

function mapDispatchToProps(dispatch) {
    return {
        onResetClick: () => dispatch(reset()),
    };
}

export default connect(null, mapDispatchToProps)(ResetButton);
