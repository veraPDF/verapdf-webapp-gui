import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip, Typography } from '@material-ui/core';

import './FileName.scss';

function FileName({ title, component, size }) {
    return (
        <Box display="flex" justifyContent="center">
            <Tooltip title={title || ''}>
                <Typography
                    className={`job-filename job-filename__${size}`}
                    variant="inherit"
                    component={component}
                    color="textPrimary"
                >
                    {title || ''}
                </Typography>
            </Tooltip>
        </Box>
    );
}

FileName.propTypes = {
    title: PropTypes.string.isRequired,
};

export default FileName;
