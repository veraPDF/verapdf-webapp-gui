import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useTheme } from '@material-ui/core/styles';
import { Chart } from 'react-google-charts';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import FileName from '../../../../shared/fileName/FileName';
import { OptionShape } from '../../../../shared/select/Select';

import { getFileDescriptor } from '../../../../../store/pdfFiles/selectors';
import { getResultSummary, getJobEndStatus } from '../../../../../store/job/result/selectors';
import { getProfileOptions } from '../../../../../store/validationProfiles/selectors';

import './Summary.scss';

const JOB_END_STATUS = {
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout',
};

function Summary({ fileInfo, profiles, selectedProfile, resultSummary, jobEndStatus }) {
    return (
        <Paper className="summary">
            <FileName fileInfo={fileInfo} component="h2" size="max" />
            <p>{profiles.filter(({ value }) => value === selectedProfile)[0].label}</p>
            {jobEndStatus === JOB_END_STATUS.CANCELLED && <CanceledSummary />}
            {jobEndStatus === JOB_END_STATUS.TIMEOUT && <TimeoutSummary />}
            {![JOB_END_STATUS.TIMEOUT, JOB_END_STATUS.CANCELLED].includes(jobEndStatus) && (
                <ProcessedSummary resultSummary={resultSummary} />
            )}
        </Paper>
    );
}

function ProcessedSummary({ resultSummary }) {
    const theme = useTheme();
    const [chartReady, setChartReady] = useState(false);
    const chartData = useMemo(() => buildChartData(resultSummary), [resultSummary]);
    const chartOptions = useMemo(() => getChartOptions(theme), [theme]);
    const chartEvents = useMemo(() => [{ eventName: 'ready', callback: () => setChartReady(true) }], [setChartReady]);
    const compliancePercent = useMemo(() => calculateCompliance(resultSummary), [resultSummary]);
    return (
        <>
            <section className="summary__chart">
                <Chart
                    chartType="PieChart"
                    loader={<CircularProgress />}
                    data={chartData}
                    options={chartOptions}
                    chartEvents={chartEvents}
                />
                <div className={classNames('summary__compliance', { summary__compliance_hidden: !chartReady })}>
                    <span>{compliancePercent}%</span>
                    compliant
                </div>
            </section>
            <ul className="legend">
                <LegendItem value={resultSummary.passedChecks} label="checks passed" type="passed" />
                <LegendItem value={resultSummary.failedChecks} label="errors" type="failed" />
            </ul>
        </>
    );
}

function CanceledSummary() {
    return (
        <div className="error-section error-section_cancelled">
            <HighlightOffIcon />
            Cancelled
        </div>
    );
}

function TimeoutSummary() {
    return (
        <div className="error-section error-section_timeout">
            <ErrorOutline />
            Timeout
        </div>
    );
}

function buildChartData({ passedChecks, failedChecks }) {
    return [
        ['Check', 'Number'],
        ['Passed', passedChecks],
        ['Error', failedChecks],
    ];
}

function getChartOptions(theme) {
    return {
        pieHole: 0.7,
        title: '',
        slices: [{ color: theme.palette.success.main }, { color: theme.palette.error.main }],
        legend: 'none',
        pieSliceText: 'none',
        height: '300px',
        width: '300px',
        chartArea: {
            height: '80%',
        },
    };
}

function calculateCompliance({ passedChecks, failedChecks }) {
    const total = passedChecks + failedChecks;
    if (total === 0) {
        return 100;
    }
    return Math.floor((passedChecks * 100) / total);
}

function LegendItem({ label, value, type }) {
    if (value === 0) {
        return null;
    }

    return (
        <li className={classNames('legend-item', `legend-item_${type}`)}>
            <FiberManualRecordIcon className="legend-item__icon" />
            {value} {label}
        </li>
    );
}

const SummaryInterface = PropTypes.shape({
    passedChecks: PropTypes.number,
    failedChecks: PropTypes.number,
});

const FileInfoInterface = PropTypes.shape({
    name: PropTypes.string.isRequired,
});

Summary.propTypes = {
    resultSummary: SummaryInterface.isRequired,
    fileInfo: FileInfoInterface.isRequired,
    profiles: PropTypes.arrayOf(OptionShape).isRequired,
    selectedProfile: PropTypes.string,
    jobEndStatus: PropTypes.string,
};

function mapStateToProps(state) {
    return {
        resultSummary: getResultSummary(state),
        fileInfo: getFileDescriptor(state),
        profiles: getProfileOptions(state),
        selectedProfile: state.jobSettings.profile,
        jobEndStatus: getJobEndStatus(state),
    };
}
export default connect(mapStateToProps)(Summary);
