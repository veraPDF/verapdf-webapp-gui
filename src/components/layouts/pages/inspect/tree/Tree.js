import React, { useState, useCallback, Fragment, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getRuleSummaries } from '../../../../../store/job/result/selectors';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import InfoDialog from '../../../../shared/dialog/Dialog';
import Button from '../../../../shared/button/Button';

import './Tree.scss';
import errorMap from '../validationErrorMessages_en.json';

const MORE_DETAILS = 'More details';
const LIST_HEADER = 'Errors overview';
const METADATA = 'metadata';
const UNSELECTED = -1;

function Tree({ ruleSummaries, selectedCheck, setSelectedCheck, errorsMap }) {
    const [expandedRule, setExpandedRule] = useState(UNSELECTED);
    const onRuleClick = useCallback(
        index => {
            if (expandedRule === index) {
                return setExpandedRule(UNSELECTED);
            }

            return setExpandedRule(index);
        },
        [expandedRule]
    );
    const onCheckClick = useCallback(context => setSelectedCheck(context), [setSelectedCheck]);

    // info dialog props
    const [openedRule, setOpenedRule] = useState(UNSELECTED);
    const [infoDialogOpened, setInfoDialogOpened] = useState(false);
    const onInfoClick = useCallback(rule => {
        setOpenedRule(rule);
        setInfoDialogOpened(true);
    }, []);
    const onInfoDialogClose = useCallback(() => {
        setInfoDialogOpened(false);
    }, []);

    useEffect(
        useCallback(() => {
            if (selectedCheck) {
                let rule = ruleSummaries.findIndex(rule => rule.checks.find(check => check.context === selectedCheck));
                if (rule !== -1 && rule !== expandedRule) {
                    setExpandedRule(rule);
                }
            }
        }, [expandedRule, ruleSummaries, selectedCheck]),
        [selectedCheck]
    );

    return (
        <section className="summary-tree">
            <List
                className="summary-tree__list"
                aria-labelledby="summary-tree-subheader"
                subheader={
                    <ListSubheader component="div" id="summary-tree-subheader" disableSticky>
                        {LIST_HEADER}
                    </ListSubheader>
                }
            >
                <RuleList
                    ruleSummaries={ruleSummaries}
                    expandedRule={expandedRule}
                    selectedCheck={selectedCheck}
                    onRuleClick={onRuleClick}
                    onCheckClick={onCheckClick}
                    onInfoClick={onInfoClick}
                    errorsMap={errorsMap}
                />
            </List>
            {openedRule !== UNSELECTED && (
                <InfoDialog title={getRuleTitle(openedRule)} open={infoDialogOpened} onClose={onInfoDialogClose}>
                    {getRuleDescription(openedRule)}
                    <RuleDetailsButton rule={openedRule} />
                </InfoDialog>
            )}
        </section>
    );
}

// TODO: add Warnings
function RuleList({ ruleSummaries, expandedRule, selectedCheck, onRuleClick, onCheckClick, onInfoClick, errorsMap }) {
    return ruleSummaries.map((rule, index) => {
        const checks = rule.checks.filter(({ context }) => !isMetadata(context));
        const ruleTitle = getRuleTitle(rule);
        return (
            <Fragment key={index}>
                <ListItem button onClick={() => onRuleClick(index)} className="rule-item rule-item_error">
                    {checks.length ? expandedRule === index ? <ExpandMoreIcon /> : <ChevronRightIcon /> : []}
                    <ListItemText
                        title={ruleTitle}
                        className="rule-item__content"
                        primary={
                            <>
                                <span className="content-text">{ruleTitle}</span>
                                {checks.length ? (
                                    <Chip size="small" className="rule-item__chip" label={checks.length} />
                                ) : null}
                            </>
                        }
                    />
                    <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="info" size="small" onClick={() => onInfoClick(rule)}>
                            <InfoOutlinedIcon />
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                {checks.length ? (
                    <Collapse in={expandedRule === index} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            <CheckList
                                checks={checks}
                                selectedCheck={selectedCheck}
                                onCheckClick={onCheckClick}
                                errorsMap={errorsMap}
                            />
                        </List>
                    </Collapse>
                ) : null}
            </Fragment>
        );
    });
}

function CheckList({ checks, selectedCheck, onCheckClick, errorsMap }) {
    let checksSorted = sortChecksByPage(checks, errorsMap);
    return checksSorted.map(({ context }, index) => {
        const checkTitle = getCheckTitle(context, index, checksSorted, errorsMap);
        return (
            <ListItem
                key={index}
                onClick={() => onCheckClick(context)}
                selected={selectedCheck === context}
                button
                className="check-item"
                title={context}
            >
                <ListItemText primary={checkTitle} />
            </ListItem>
        );
    });
}

function RuleDetailsButton(rule) {
    const url = getRuleUrl(rule);
    if (!url) {
        return null;
    }

    return (
        <Button className="more-details-link" target="_blank" rel="noreferrer" color="primary" href={url}>
            {MORE_DETAILS}
        </Button>
    );
}

function getRuleDescription({ specification, clause, testNumber, description }) {
    return errorMap?.[specification]?.[clause]?.[testNumber]?.DESCRIPTION || description;
}

function getRuleTitle({ specification, clause, testNumber }) {
    return (
        errorMap?.[specification]?.[clause]?.[testNumber]?.SUMMARY ||
        `${specification}, clause ${clause}, test ${testNumber}`
    );
}

function getRuleUrl({ specification, clause, testNumber }) {
    return errorMap?.[specification]?.[clause]?.[testNumber]?.URL;
}

function getCheckTitle(context, index, allChecks, errorsMap) {
    const page = getPageNumber(context, errorsMap);
    const pageString = page === UNSELECTED ? '' : `Page ${page}: `;

    let length = 0;
    let number = 1;
    allChecks.forEach((check, checkIndex) => {
        if (getPageNumber(check.context, errorsMap) !== page) {
            return;
        }

        length++;
        if (checkIndex < index) {
            number++;
        }
    });
    return `${pageString}${number} of ${length}`;
}

function getPageNumber(context, errorsMap) {
    // Unrecognized context
    if (
        !errorsMap[context] ||
        errorsMap[context].pageIndex === UNSELECTED ||
        (!errorsMap[context].listOfMcid.length &&
            errorsMap[context].listOfMcid instanceof Array &&
            errorsMap[context].pageIndex !== METADATA)
    ) {
        return UNSELECTED;
    }

    // context to skip
    if (errorsMap[context].pageIndex === METADATA) {
        return false;
    }

    return errorsMap[context].pageIndex + 1;
}

function isMetadata(context) {
    return context.toLowerCase().match(METADATA);
}

function sortChecksByPage(checks, errorsMap) {
    let newChecks = [...checks];
    newChecks.sort(({ context: a }, { context: b }) => {
        const pageA = getPageNumber(a, errorsMap);
        const pageB = getPageNumber(b, errorsMap);

        if (pageB === UNSELECTED) return 1;
        if (pageA === UNSELECTED) return -1;

        return pageA - pageB;
    });
    return newChecks;
}

const SummaryInterface = PropTypes.shape({
    clause: PropTypes.string.isRequired,
    testNumber: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    checks: PropTypes.arrayOf(PropTypes.object).isRequired,
});

Tree.propTypes = {
    ruleSummaries: PropTypes.arrayOf(SummaryInterface).isRequired,
    selectedCheck: PropTypes.string,
    setSelectedCheck: PropTypes.func.isRequired,
    errorsMap: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
    return {
        ruleSummaries: getRuleSummaries(state),
    };
}

export default connect(mapStateToProps)(Tree);
