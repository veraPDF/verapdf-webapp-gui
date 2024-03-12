import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Box } from '@material-ui/core';
import MaterialDialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../button/Button';
import { TAGS } from '../../layouts/pages/inspect/constants';

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
            {title && (
                <DialogTitle id="alert-dialog-title" className="dialog-title">
                    {title}
                </DialogTitle>
            )}
            <Tooltip title="Close">
                <Box
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        cursor: 'pointer',
                        width: 20,
                        height: 20,
                    }}
                >
                    <CloseIcon className="close-icon" aria-label="close" onClick={onClose} />
                </Box>
            </Tooltip>
            <DialogContent className="dialog-content-main">
                <DialogContentText id="alert-dialog-description">{children}</DialogContentText>
            </DialogContent>
            {!!tagsNames?.length && (
                <DialogContent className="dialog-content-footer">
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
