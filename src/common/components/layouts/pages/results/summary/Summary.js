import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import classNames from 'classnames';
import _ from 'lodash';

import Paper from '@material-ui/core/Paper';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import FileName from '../../../../shared/fileName/FileName';
import { OptionShape } from '../../../../shared/select/Select';

import { getFileName } from '../../../../../store/pdfFiles/selectors';
import { getFileNameLink } from '../../../../../store/pdfLink/selectors';
import { getResultSummary, getJobEndStatus } from '../../../../../store/job/result/selectors';
import { getProfileOptions } from '../../../../../store/validationProfiles/selectors';
import { isFileUploadMode } from '../../../../../store/application/selectors';
import { SummaryInterface as RuleSummariesInterface } from '../../inspect/tree/Tree';

import './Summary.scss';

import errorTags from '../../inspect/validationErrorTags.json';

const JOB_END_STATUS = {
    CANCELLED: 'cancelled',
    TIMEOUT: 'timeout',
};
const CATEGORY = 'Category';

function Summary({ fileName, profiles, selectedProfile, resultSummary, jobEndStatus }) {
    return (
        <Paper className="summary">
            <FileName title={fileName} component="h2" size="max" />
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
    const listOfErrors = useMemo(() => getListOfErrors(resultSummary.ruleSummaries), [resultSummary]);

    return (
        <>
            <section className="summary__list">
                <ul className="list">
                    {listOfErrors?.map(([key, value]) => (
                        <ListItem key={key} label={key} value={value} hasError={value > 0} />
                    ))}
                </ul>
            </section>
            <ul className="legend">
                <LegendItem value={resultSummary.passedChecks ?? 0} label="checks passed" type="passed" />
                <LegendItem value={resultSummary.failedChecks ?? 0} label="errors" type="failed" />
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

function getListOfErrors(ruleSummaries) {
    const listOfErrors = {};
    const otherIndexes = [];
    const categoryTags = errorTags[CATEGORY].map(({ name }) => name);
    categoryTags.forEach(key => {
        listOfErrors[key] = ruleSummaries
            ?.filter((rule, index) => {
                if (_.isNil(rule)) return false;
                // Avoid duplicated rules in different categories
                const isRuleShow = rule.tags?.includes(key) && !otherIndexes.includes(index);
                if (isRuleShow) {
                    otherIndexes.push(index);
                }
                return isRuleShow;
            })
            .reduce((num, item) => num + item.failedChecks, 0);
    });
    const sortedList = _.sortBy(_.toPairs(listOfErrors), 1).reverse();
    return sortedList;
}

function LegendItem({ label, value, type }) {
    return (
        <li className={classNames('legend-item', `legend-item_${type}`)}>
            <FiberManualRecordIcon className="legend-item__icon" />
            {value} {label}
        </li>
    );
}

function ListItem({ label, value, hasError }) {
    return (
        <li className={classNames('list-item', `list-item_${hasError ? 'failed' : 'passed'}`)}>
            <FiberManualRecordIcon className="list-item__icon" />
            {_.startCase(label)}:
            <span>
                {value} {value === 1 ? 'error' : 'errors'}
            </span>
        </li>
    );
}

const SummaryInterface = PropTypes.shape({
    passedChecks: PropTypes.number,
    failedChecks: PropTypes.number,
    ruleSummaries: PropTypes.arrayOf(RuleSummariesInterface).isRequired,
});

Summary.propTypes = {
    resultSummary: SummaryInterface.isRequired,
    fileName: PropTypes.string.isRequired,
    profiles: PropTypes.arrayOf(OptionShape).isRequired,
    selectedProfile: PropTypes.string,
    jobEndStatus: PropTypes.string,
};

function mapStateToProps(state) {
    return {
        resultSummary: getResultSummary(state),
        fileName: isFileUploadMode(state) ? getFileName(state) : getFileNameLink(state),
        profiles: getProfileOptions(state),
        selectedProfile: state.jobSettings.profile,
        jobEndStatus: getJobEndStatus(state),
    };
}
export default connect(mapStateToProps)(Summary);
