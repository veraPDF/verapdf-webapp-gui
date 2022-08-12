import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import _ from 'lodash';

import AppPages from '../../../../AppPages';
import { getJobId } from '../../../../../store/job/selectors';
import Button from '../../../../shared/button/Button';
import Select from '../../../../shared/select/Select';
import Pagination from '../../../../shared/pagination/Pagination';
import { getNumPages, getPage } from '../../../../../store/application/selectors';
import { setPage } from '../../../../../store/application/actions';

import './Toolbar.scss';

const BACK = 'Back to summary';

function Toolbar({ jobId, name, scale, scaleOptions, page, numPages, onScaleChanged, setPage }) {
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
                <Typography className="toolbar__filename" variant="body2" component="div" noWrap title={name}>
                    {name}
                </Typography>
            </section>
            <section className="toolbar__end">
                <Pagination page={page} numPages={numPages} setPage={setPage} />
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
    page: PropTypes.number.isRequired,
    numPages: PropTypes.number.isRequired,
    onScaleChanged: PropTypes.func.isRequired,
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
