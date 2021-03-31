import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import _ from 'lodash';

import AppPages from '../../../../AppPages';
import { getJobId } from '../../../../../store/job/selectors';
import Button from '../../../../shared/button/Button';
import Select from '../../../../shared/select/Select';

import './Toolbar.scss';

const BACK = 'Back to summary';

function Toolbar({ jobId, name, scale, scaleOptions, onScaleChanged }) {
    const history = useHistory();
    const onBackClick = useMemo(() => () => history.push(AppPages.RESULTS.url(jobId)), [history, jobId]);
    const currentScaleIndex = useMemo(() => _.findIndex(scaleOptions, { value: scale }), [scaleOptions, scale]);
    const onZoomIn = useCallback(() => {
        if (currentScaleIndex < scaleOptions.length - 1) {
            onScaleChanged(scaleOptions[currentScaleIndex + 1].value);
        }
    }, [scaleOptions, currentScaleIndex, onScaleChanged]);
    const onZoomOut = useCallback(() => {
        if (currentScaleIndex > 0) {
            onScaleChanged(scaleOptions[currentScaleIndex - 1].value);
        }
    }, [scaleOptions, currentScaleIndex, onScaleChanged]);

    return (
        <section className="toolbar">
            <section className="toolbar__start">
                <Button onClick={onBackClick}>
                    <ArrowBack />
                    {BACK}
                </Button>
            </section>
            <section className="toolbar__center">
                <h1>{name}</h1>
            </section>
            <section className="toolbar__end">
                <IconButton onClick={onZoomOut} size="small" disabled={!currentScaleIndex}>
                    <RemoveIcon />
                </IconButton>
                <IconButton onClick={onZoomIn} size="small" disabled={currentScaleIndex === scaleOptions.length - 1}>
                    <AddIcon />
                </IconButton>
                <Select
                    width={30}
                    id="scaleSelect"
                    className="toolbar__select"
                    options={scaleOptions}
                    value={scale}
                    onChange={onScaleChanged}
                />
            </section>
        </section>
    );
}

Toolbar.propTypes = {
    name: PropTypes.string,
    jobId: PropTypes.string,
    scale: PropTypes.string.isRequired,
    scaleOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
    onScaleChanged: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        jobId: getJobId(state),
    };
}

export default connect(mapStateToProps)(Toolbar);
