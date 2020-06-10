import React, { useState, useCallback, Fragment, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';

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
    const onCheckClick = useCallback(checkKey => setSelectedCheck(checkKey), [setSelectedCheck]);

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
                let [ruleIndex] = selectedCheck.split(':');
                ruleIndex = parseInt(ruleIndex);
                if (ruleIndex !== expandedRule) {
                    setExpandedRule(ruleIndex);
                }
            }
        }, [expandedRule, selectedCheck]),
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
        const checks = rule.checks;
        const ruleTitle = getRuleTitle(rule);
        return (
            <Fragment key={index}>
                <ListItem button onClick={() => onRuleClick(index)} className="rule-item rule-item_error">
                    {checks.length ? expandedRule === index ? <ExpandMoreIcon /> : <ChevronRightIcon /> : []}
                    <ListItemText
                        title={ruleTitle}
                        className={classNames('rule-item__content', { 'rule-item__content_empty': !checks.length })}
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
                    <Collapse in={expandedRule === index} timeout={0} unmountOnExit>
                        <List component="div" disablePadding>
                            <CheckList
                                ruleIndex={index}
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

function CheckList({ checks, selectedCheck, onCheckClick, errorsMap, ruleIndex }) {
    let checksSorted = sortChecksByPage(checks, errorsMap);
    return checksSorted.map(({ context }, index) => {
        const checkKey = `${ruleIndex}:${context}`;
        const checkTitle = getCheckTitle({ context, index, allChecks: checksSorted, errorsMap, ruleIndex });
        return (
            <LI
                key={index}
                onClick={() => onCheckClick(checkKey)}
                selected={selectedCheck === checkKey}
                button
                className="check-item"
                title={context}
                checkTitle={checkTitle}
            />
        );
    });
}

function LI({ selected, title, checkTitle, onClick, className }) {
    // prevent auto scroll when was clicked itself
    const [disableAutoScroll, setDisableAutoScroll] = useState(false);
    const onItemClick = useCallback(() => {
        setDisableAutoScroll(true);
        return onClick();
    }, [onClick]);
    const listItem = useRef();
    useEffect(
        useCallback(() => {
            if (selected && !disableAutoScroll) {
                // To be sure that list expanded before auto scroll call it in next tick
                setTimeout(() => listItem.current.scrollIntoView({ block: 'center' }), 0);
            } else {
                setDisableAutoScroll(false);
            }
        }, [disableAutoScroll, selected]),
        [selected]
    );

    return (
        <ListItem onClick={onItemClick} selected={selected} button className={className} title={title} ref={listItem}>
            <ListItemText primary={checkTitle} />
        </ListItem>
    );
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

function getCheckTitle({ context, index, allChecks, errorsMap, ruleIndex }) {
    const page = getPageNumber(`${ruleIndex}:${context}`, errorsMap);
    const pageString = page === UNSELECTED ? '' : `Page ${page}: `;

    let length = 0;
    let number = 1;
    allChecks.forEach((check, checkIndex) => {
        if (getPageNumber(`${ruleIndex}:${check.context}`, errorsMap) !== page) {
            return;
        }

        length++;
        if (checkIndex < index) {
            number++;
        }
    });
    return `${pageString}${number} of ${length}`;
}

function getPageNumber(checkKey, errorsMap) {
    // Unrecognized context
    if (
        !errorsMap[checkKey] ||
        errorsMap[checkKey].pageIndex === UNSELECTED ||
        (!errorsMap[checkKey].listOfMcid.length &&
            errorsMap[checkKey].listOfMcid instanceof Array &&
            errorsMap[checkKey].pageIndex !== METADATA)
    ) {
        return UNSELECTED;
    }

    return errorsMap[checkKey].pageIndex + 1;
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
