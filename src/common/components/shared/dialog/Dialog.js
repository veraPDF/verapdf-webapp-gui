import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import MaterialDialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Button from '../button/Button';

import { TAGS } from '../../layouts/pages/inspect/Inspect';

import './Dialog.scss';

function Dialog({ title, tagsNames, actions, open, onClose, children }) {
    const tagsArray = useMemo(() => {
        return tagsNames.map((tagName, index) => {
            const description = TAGS.find(tag => tag.name === tagName)?.description ?? '';
            return (
                <li key={index}>
                    <Tooltip title={description}>
                        <Chip variant="outlined" color="primary" className="dialog__tags__tag" label={tagName} />
                    </Tooltip>
                </li>
            );
        });
    }, [tagsNames]);

    return (
        <MaterialDialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            className="dialog"
        >
            {title && <DialogTitle id="alert-dialog-title">{title}</DialogTitle>}
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{children}</DialogContentText>
            </DialogContent>
            {!!tagsNames?.length && (
                <DialogContent>
                    <Paper component="ul" className="dialog__tags">
                        {tagsArray}
                    </Paper>
                </DialogContent>
            )}
            {actions && (
                <DialogActions className="dialog__actions">
                    <Actions actions={actions} />
                </DialogActions>
            )}
        </MaterialDialog>
    );
}

function Actions({ actions }) {
    return actions.map((props, index) => (
        <div key={index} className={classNames({ _start: props.align === 'start' })}>
            <Button {...props}>{props.label}</Button>
        </div>
    ));
}

export const ActionShape = PropTypes.shape({
    label: PropTypes.string,
    variant: PropTypes.string,
    color: PropTypes.string,
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    align: PropTypes.string,
});

Dialog.propTypes = {
    actions: PropTypes.arrayOf(ActionShape),
    title: PropTypes.string,
    tagsNames: PropTypes.arrayOf(PropTypes.string),
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Dialog;
