import React, { useState, useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Input from '../input/Input';
import { setPage } from '../../../store/application/actions';
import { getPage } from '../../../store/application/selectors';

import IconButton from '@material-ui/core/IconButton';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Typography from '@material-ui/core/Typography';

import './Pagination.scss';

function Pagination({ numPages, page, setPage }) {
    const [pageValue, setPageValue] = useState(page + '');

    const onChange = page => setPageValue(page);

    const onChangeFinish = useCallback(() => {
        const pageNumber = parseInt(pageValue);
        if (_.isFinite(pageNumber) && pageNumber > 0 && pageNumber <= numPages) {
            setPage(pageNumber);
        } else {
            setPage(page);
            setPageValue(page + '');
        }
    }, [pageValue, numPages, setPage, page]);

    useEffect(() => {
        setPageValue(page + '');
    }, [page]);

    const onNextPage = useCallback(() => {
        if (page < numPages) {
            setPage(page + 1);
        }
    }, [numPages, page, setPage]);

    const onPreviousPage = useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page, setPage]);

    return (
        <div className="pagination">
            <div className="pagination__buttons">
                <IconButton size="small" disabled={page === 1} onClick={onPreviousPage}>
                    <ArrowUpward />
                </IconButton>
                <IconButton size="small" disabled={page === numPages} onClick={onNextPage}>
                    <ArrowDownward />
                </IconButton>
            </div>
            <Input
                value={pageValue}
                className="pagination__input"
                onChange={onChange}
                onBlur={onChangeFinish}
                onEnter={onChangeFinish}
                id="paginationInput"
                type="number"
                inputProps={{ min: 1, max: numPages }}
                disabled={!numPages}
            />
            <Typography className="pagination__max" variant="body2" component="div" noWrap>
                of {numPages}
            </Typography>
        </div>
    );
}

Pagination.propTypes = {
    numPages: PropTypes.number.isRequired,
};

const mapStateToProps = state => {
    return {
        page: getPage(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        setPage: page => dispatch(setPage(page)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Pagination);
