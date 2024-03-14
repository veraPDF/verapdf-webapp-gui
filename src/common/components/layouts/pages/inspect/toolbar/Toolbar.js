import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import _ from 'lodash';

import ArrowBack from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import AppPages from '../../../../AppPages';
import { getJobId } from '../../../../../store/job/selectors';
import Button from '../../../../shared/button/Button';
import Select from '../../../../shared/select/Select';
import Pagination from '../../../../shared/pagination/Pagination';
import { getNumPages, getPage } from '../../../../../store/application/selectors';
import { setPage } from '../../../../../store/application/actions';
import { scaleAdvancedValues } from '../constants';

import './Toolbar.scss';

const BACK = 'Back to summary';

function Toolbar({ jobId, name, scale, mode, scaleOptions, page, numPages, onScaleChanged, onModeChanged, setPage }) {
    const history = useHistory();
    const isAutozoom = useMemo(() => scaleAdvancedValues.includes(mode), [mode]);
    const onBackClick = useMemo(() => () => history.push(AppPages.RESULTS.url(jobId)), [history, jobId]);
    const currentScaleIndex = useMemo(() => _.findIndex(scaleOptions.basic, { value: scale }), [scaleOptions, scale]);

    const onZoomIn = useCallback(() => {
        if (currentScaleIndex < scaleOptions.basic.length - 1) {
            onScaleChanged(scaleOptions.basic[currentScaleIndex + 1].value);
        }
    }, [scaleOptions, currentScaleIndex, onScaleChanged]);
    const onZoomOut = useCallback(() => {
        if (currentScaleIndex > 0) {
            onScaleChanged(scaleOptions.basic[currentScaleIndex - 1].value);
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
                <Typography className="toolbar__filename" variant="body2" component="div" noWrap title={name}>
                    {name}
                </Typography>
            </section>
            <section className="toolbar__end">
                <Pagination page={page} numPages={numPages} setPage={setPage} />
                <IconButton onClick={onZoomOut} size="small" disabled={!currentScaleIndex || isAutozoom}>
                    <RemoveIcon />
                </IconButton>
                <IconButton
                    onClick={onZoomIn}
                    size="small"
                    disabled={currentScaleIndex === scaleOptions.basic.length - 1 || isAutozoom}
                >
                    <AddIcon />
                </IconButton>
                <Select
                    width={30}
                    id="scaleSelect"
                    className="toolbar__select"
                    options={[...scaleOptions.advanced, ...scaleOptions.basic]}
                    value={scale}
                    mode={mode}
                    onChange={onScaleChanged}
                    onMode={onModeChanged}
                />
            </section>
        </section>
    );
}

Toolbar.propTypes = {
    name: PropTypes.string,
    jobId: PropTypes.string,
    scale: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    scaleOptions: PropTypes.object.isRequired,
    page: PropTypes.number.isRequired,
    numPages: PropTypes.number.isRequired,
    onScaleChanged: PropTypes.func.isRequired,
    onModeChanged: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        jobId: getJobId(state),
        page: getPage(state),
        numPages: getNumPages(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setPage: page => dispatch(setPage(page)),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
