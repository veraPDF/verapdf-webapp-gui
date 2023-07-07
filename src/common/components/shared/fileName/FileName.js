import React from 'react';
import PropTypes from 'prop-types';
import { Box, Tooltip, Typography } from '@material-ui/core';

import './FileName.scss';

function FileName({ fileInfo, component, size }) {
    return (
        <Box display="flex" justifyContent="center">
            <Tooltip title={fileInfo.name || ''}>
                <Typography
                    className={`job-filename job-filename__${size}`}
                    variant="inherit"
                    component={component}
                    color="textPrimary"
                >
                    {fileInfo.name || ''}
                </Typography>
            </Tooltip>
        </Box>
    );
}

const FileInfoInterface = PropTypes.shape({
    name: PropTypes.string.isRequired,
});

FileName.propTypes = {
    fileInfo: FileInfoInterface.isRequired,
};

export default FileName;
