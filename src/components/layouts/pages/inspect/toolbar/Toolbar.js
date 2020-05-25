import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import AppPages from '../../../../AppPages';
import { getJobId } from '../../../../../store/job/selectors';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Button from '../../../../shared/button/Button';

import './Toolbar.scss';

const BACK = 'Back to summary';

function Toolbar({ jobId, name }) {
    const history = useHistory();
    const onBackClick = useMemo(() => () => history.push(AppPages.RESULTS.url(jobId)), [history, jobId]);

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
            <section className="toolbar__end" />
        </section>
    );
}

Toolbar.propTypes = {
    name: PropTypes.string,
    jobId: PropTypes.string,
};

function mapStateToProps(state) {
    return {
        jobId: getJobId(state),
    };
}

export default connect(mapStateToProps)(Toolbar);
