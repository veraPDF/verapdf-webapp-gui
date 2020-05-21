import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';

import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import { useTheme } from '@material-ui/core/styles';
import { Chart } from 'react-google-charts';

import { getFileDescriptor } from '../../../../../store/pdfFiles/selectors';
import { getResultSummary } from '../../../../../store/job/result/selectors';

import './Summary.scss';

function Summary({ fileInfo, resultSummary }) {
    const theme = useTheme();
    const [chartReady, setChartReady] = useState(false);
    const chartData = useMemo(() => buildChartData(resultSummary), [resultSummary]);
    const chartOptions = useMemo(() => getChartOptions(theme), [theme]);
    const chartEvents = useMemo(() => [{ eventName: 'ready', callback: () => setChartReady(true) }], [setChartReady]);
    const compliancePercent = useMemo(() => calculateCompliance(resultSummary), [resultSummary]);
    return (
        <Paper className="summary">
            <h2>{fileInfo.name}</h2>
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
                <LegendItem className="legend__item_passed" value={resultSummary.passedChecks} label="checks passed" />
                <LegendItem className="legend__item_failed" value={resultSummary.failedChecks} label="errors" />
            </ul>
        </Paper>
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
        chartArea: {
            height: '80%',
        },
    };
}

function calculateCompliance({ passedChecks, failedChecks }) {
    const total = passedChecks + failedChecks;
    return Math.round((passedChecks * 100) / total);
}

function LegendItem({ className, label, value }) {
    if (value === 0) {
        return null;
    }
    return (
        <li className={classNames('legend__item', className)}>
            {value} {label}
        </li>
    );
}

const SummaryInterface = PropTypes.shape({
    passedChecks: PropTypes.number.isRequired,
    failedChecks: PropTypes.number.isRequired,
});

const FileInfoInterface = PropTypes.shape({
    name: PropTypes.string.isRequired,
});

Summary.propTypes = {
    resultSummary: SummaryInterface.isRequired,
    fileInfo: FileInfoInterface.isRequired,
};

function mapStateToProps(state) {
    return {
        resultSummary: getResultSummary(state),
        fileInfo: getFileDescriptor(state),
    };
}
export default connect(mapStateToProps)(Summary);
