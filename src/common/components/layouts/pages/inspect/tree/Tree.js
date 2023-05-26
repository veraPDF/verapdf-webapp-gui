import React, { useState, useCallback, Fragment, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { scrollToActiveBbox } from 'verapdf-js-viewer';
import LanguageIcon from '@material-ui/icons/Language';
import { Menu, MenuItem, Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import _ from 'lodash';
import { usePrevious } from 'react-use';

import { getRuleSummaries } from '../../../../../store/job/result/selectors';
import { getProfile } from '../../../../../store/job/settings/selectors';
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
import { getItem, setItem } from '../../../../../services/localStorageService';
import { LS_ERROR_MESSAGES_LANGUAGE } from '../../../../../store/constants';

import './Tree.scss';
import errorMap_en from '../validationErrorMessages_en.json';
import errorMap_nl from '../validationErrorMessages_nl.json';
import errorMap_de from '../validationErrorMessages_de.json';
import errorMap_technical from '../validationErrorMessages_technical.json';
import errorMap_tagged_technical from '../TaggedPDF_technical.json';

const MORE_DETAILS = 'More details';
const LIST_HEADER = 'Errors overview';
const METADATA = 'metadata';
const UNSELECTED = -1;
export const languageEnum = {
    English: 'English',
    Dutch: 'Dutch',
    German: 'German',
    Technical: 'Technical',
};
export const errorProfiles = {
    TAGGED_PDF: 'TAGGED_PDF',
    OTHER: 'Other',
};

export const errorMessagesMap = {
    [errorProfiles.OTHER]: {
        [languageEnum.English]: errorMap_en,
        [languageEnum.Dutch]: errorMap_nl,
        [languageEnum.German]: errorMap_de,
        [languageEnum.Technical]: errorMap_technical,
    },
    [errorProfiles.TAGGED_PDF]: {
        [languageEnum.Technical]: errorMap_tagged_technical,
    },
};

function Tree({ ruleSummaries, selectedCheck, setSelectedCheck, errorsMap, profile }) {
    const [language, setLanguage] = useState(getItem(LS_ERROR_MESSAGES_LANGUAGE) || languageEnum.English);
    const [anchorMenuEl, setAnchorMenuEl] = useState(null);
    const [expandedRule, setExpandedRule] = useState(UNSELECTED);
    const prevSelectedCheck = usePrevious(selectedCheck);
    const onRuleClick = useCallback(
        index => {
            if (expandedRule === index) {
                return setExpandedRule(UNSELECTED);
            }

            return setExpandedRule(index);
        },
        [expandedRule]
    );
    const onCheckClick = useCallback(
        checkKey => {
            let checkIndex = +checkKey.split(':')[1];
            let ruleIndex = +checkKey.split(':')[0];
            let sortedCheckIndex = _.findIndex(
                errorsMap,
                error => error.checkIndex === checkIndex && error.ruleIndex === ruleIndex
            );
            setSelectedCheck(sortedCheckIndex);
            setTimeout(() => scrollToActiveBbox(), 100);
        },
        [errorsMap, setSelectedCheck]
    );

    // info dialog props
    const [openedRule, setOpenedRule] = useState(UNSELECTED);
    const [infoDialogOpened, setInfoDialogOpened] = useState(false);
    const errorMessages = useMemo(() => {
        switch (profile) {
            case errorProfiles.TAGGED_PDF:
                return errorMessagesMap[profile][language];
            default:
                return errorMessagesMap[errorProfiles.OTHER][language];
        }
    }, [language, profile]);

    const onInfoClick = useCallback(rule => {
        setOpenedRule(rule);
        setInfoDialogOpened(true);
    }, []);
    const onInfoDialogClose = useCallback(() => {
        setInfoDialogOpened(false);
    }, []);
    const handleLanguageClick = useCallback(event => {
        setAnchorMenuEl(event.currentTarget);
    }, []);
    const handleLanguageClose = useCallback((language = null) => {
        if (language) {
            setItem(LS_ERROR_MESSAGES_LANGUAGE, language);
            setLanguage(language);
        }
        setAnchorMenuEl(null);
    }, []);

    useEffect(() => {
        if (selectedCheck && selectedCheck !== prevSelectedCheck) {
            let ruleIndex = errorsMap[selectedCheck]?.ruleIndex;
            if (ruleIndex !== expandedRule) {
                setExpandedRule(ruleIndex);
            }
        }
    }, [errorsMap, expandedRule, selectedCheck, prevSelectedCheck]);

    return (
        <section className="summary-tree">
            <List
                className="summary-tree__list"
                aria-labelledby="summary-tree-subheader"
                subheader={
                    <ListSubheader component="div" id="summary-tree-subheader" disableSticky>
                        {LIST_HEADER}
                        <Tooltip title={language}>
                            <IconButton size="small" onClick={handleLanguageClick}>
                                <LanguageIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="language-menu"
                            anchorEl={anchorMenuEl}
                            keepMounted
                            open={Boolean(anchorMenuEl)}
                            onClose={handleLanguageClose.bind(this, undefined)}
                        >
                            {_.keys(languageEnum).map(lKey => (
                                <MenuItem key={lKey} onClick={handleLanguageClose.bind(this, languageEnum[lKey])}>
                                    {languageEnum[lKey]}
                                </MenuItem>
                            ))}
                        </Menu>
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
                    errorMessages={errorMessages}
                />
            </List>
            {openedRule !== UNSELECTED && (
                <InfoDialog
                    title={`${getRuleNumber(openedRule, errorMessages)}${getRuleTitle(openedRule, errorMessages)}`}
                    open={infoDialogOpened}
                    onClose={onInfoDialogClose}
                >
                    {getRuleDescription(openedRule, errorMessages)}
                    <RuleDetailsButton rule={openedRule} errorMessages={errorMessages} />
                </InfoDialog>
            )}
        </section>
    );
}

// TODO: add Warnings
function RuleList({
    ruleSummaries,
    expandedRule,
    selectedCheck,
    onRuleClick,
    onCheckClick,
    onInfoClick,
    errorsMap,
    errorMessages,
}) {
    return ruleSummaries.map((rule, index) => {
        const checks = rule.checks;
        const ruleTitle = getRuleTitle(rule, errorMessages);
        const checksLabel = `${checks.length}${rule.failedChecks > checks.length ? '+' : ''}`;
        return (
            <Fragment key={index}>
                <ListItem
                    button
                    onClick={() => onRuleClick(index)}
                    className={classNames('rule-item rule-item_error', {
                        'rule-item_expanded': expandedRule === index,
                    })}
                >
                    {checks.length ? expandedRule === index ? <ExpandMoreIcon /> : <ChevronRightIcon /> : []}
                    <ListItemText
                        title={ruleTitle}
                        className={classNames('rule-item__content', { 'rule-item__content_empty': !checks.length })}
                        primary={
                            <>
                                <span className="content-text">{ruleTitle}</span>
                                {checks.length ? (
                                    <Chip size="small" className="rule-item__chip" label={checksLabel} />
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
    let checksSorted = checks.map((check, index) => {
        return {
            ...check,
            id: `${ruleIndex}:${index}:${check.location || check.context}`,
        };
    });
    checksSorted = sortChecksByPage(checksSorted, errorsMap, ruleIndex);
    return checksSorted.map(({ context, errorMessage, location, id: checkKey }, index) => {
        const checkTitle = getCheckTitle({ checkKey, index, allChecks: checksSorted, errorsMap });
        const errorTitle = errorMessage + '\n\nContext: ' + context;
        const isGrouped =
            selectedCheck &&
            errorsMap[selectedCheck] &&
            errorsMap[selectedCheck]?.groupId &&
            errorsMap[checkKey]?.groupId &&
            errorsMap[selectedCheck].groupId.split('-')?.pop() === errorsMap[checkKey].groupId.split('-')?.pop() &&
            selectedCheck !== checkKey;
        return (
            <LI
                key={index}
                onClick={() => onCheckClick(checkKey)}
                selected={errorsMap[selectedCheck]?.checkIndex === index}
                button
                className={'check-item' + (isGrouped ? ' check-item_grouped' : '')}
                title={errorTitle}
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
    const prevSelected = usePrevious(selected);

    useEffect(() => {
        if (selected === prevSelected) {
            return;
        }
        if (selected && !disableAutoScroll) {
            // To be sure that list expanded before auto scroll call it in next tick
            setTimeout(() => listItem.current?.scrollIntoView({ block: 'center' }), 0);
        } else {
            setDisableAutoScroll(false);
        }
    }, [selected, prevSelected, disableAutoScroll]);

    return (
        <ListItem onClick={onItemClick} selected={selected} button className={className} title={title} ref={listItem}>
            <ListItemText primary={checkTitle} />
        </ListItem>
    );
}

function RuleDetailsButton(rule, errorMessages) {
    const url = getRuleUrl(rule, errorMessages);
    if (!url) {
        return null;
    }

    return (
        <Button className="more-details-link" target="_blank" rel="noreferrer" color="primary" href={url}>
            {MORE_DETAILS}
        </Button>
    );
}

function getRuleDescription({ specification, clause, testNumber, description }, errorMessages) {
    return errorMessages?.[specification]?.[clause]?.[testNumber]?.DESCRIPTION || description;
}

function getRuleTitle({ specification, clause, testNumber }, errorMessages) {
    return (
        errorMessages?.[specification]?.[clause]?.[testNumber]?.SUMMARY ||
        `${specification}, clause ${clause}, test ${testNumber}`
    );
}

function getRuleNumber({ specification, clause, testNumber }, errorMessages) {
    return errorMessages?.[specification]?.[clause]?.[testNumber] ? `${clause}-${testNumber} (${specification}) ` : '';
}

function getRuleUrl({ specification, clause, testNumber }, errorMessages) {
    return errorMessages?.[specification]?.[clause]?.[testNumber]?.URL;
}

function getCheckTitle({ checkKey, index, allChecks, errorsMap }) {
    const page = getPageNumber(checkKey, errorsMap);
    const pageString = page === UNSELECTED ? '' : `Page ${page}: `;

    let length = 0;
    let number = 1;
    allChecks.forEach((check, checkIndex) => {
        if (getPageNumber(`${check.id}`, errorsMap) !== page) {
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
    let checkIndex = +checkKey.split(':')[1];
    let ruleIndex = +checkKey.split(':')[0];
    let sortedCheckIndex = _.findIndex(
        errorsMap,
        error => error.checkIndex === checkIndex && error.ruleIndex === ruleIndex
    );
    // Unrecognized context
    if (
        !errorsMap[sortedCheckIndex] ||
        errorsMap[sortedCheckIndex].pageIndex === UNSELECTED ||
        (errorsMap[sortedCheckIndex].pageIndex !== METADATA && !errorsMap[sortedCheckIndex].location)
    ) {
        return UNSELECTED;
    }
    return errorsMap[sortedCheckIndex].pageIndex + 1;
}

export function sortChecksByPage(checks, errorsMap) {
    let newChecks = [...checks];
    newChecks.sort(({ id: a }, { id: b }) => {
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
    profile: PropTypes.string.isRequired,
    selectedCheck: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    setSelectedCheck: PropTypes.func.isRequired,
    errorsMap: PropTypes.array.isRequired,
};

function mapStateToProps(state) {
    return {
        ruleSummaries: getRuleSummaries(state),
        profile: getProfile(state),
    };
}

export default connect(mapStateToProps)(Tree);
