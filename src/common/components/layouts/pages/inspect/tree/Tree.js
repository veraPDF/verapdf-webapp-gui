import React, { useState, useCallback, Fragment, useEffect, useRef, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { scrollToActiveBbox } from 'verapdf-js-viewer';
import FilterListIcon from '@material-ui/icons/FilterList';
import LanguageIcon from '@material-ui/icons/Language';
import { Menu, MenuItem, Tooltip } from '@material-ui/core';
import classNames from 'classnames';
import { usePrevious } from 'react-use';
import _ from 'lodash';

import { getRuleSummaries, getTags } from '../../../../../store/job/result/selectors';
import { getProfile } from '../../../../../store/job/settings/selectors';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Collapse from '@material-ui/core/Collapse';
import Chip from '@material-ui/core/Chip';
import Popover from '@material-ui/core/Popover';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import FilterPopup from './filterPopup/FilterPopup';
import InfoDialog from '../../../../shared/dialog/Dialog';
import Button from '../../../../shared/button/Button';
import { getItem, setItem } from '../../../../../services/localStorageService';
import { getAvailableGroups } from '../../../../../services/treeService';
import { LS_ERROR_MESSAGES_LANGUAGE } from '../../../../../store/constants';
import { TAGS_NAMES } from '../constants';

import './Tree.scss';

import errorTags from '../validationErrorTags.json';
import errorMap_en from '../errorMessages/english/validationErrorMessages_en.json';
import errorMap_nl from '../errorMessages/dutch/validationErrorMessages_nl.json';
import errorMap_de from '../errorMessages/german/validationErrorMessages_de.json';
import errorMap_technical from '../errorMessages/technical/validationErrorMessages_technical.json';
import errorMap_tagged_technical from '../errorMessages/technical/TaggedPDF_technical.json';
import errorMap_pdfua_technical from '../errorMessages/technical/PDFUA2_technical.json';

const MORE_DETAILS = 'More details';
const LIST_HEADER = 'Errors overview';
const LIST_OTHERS = 'All others';
const LIST_NO_ERRORS = 'No errors found';
const FILTER_TOOLTIP = 'Grouping and filtering';
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
    PDFUA_2: 'PDFUA_2',
    PDFUA_2_TAGGED_PDF: 'PDFUA_2_TAGGED_PDF',
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
    [errorProfiles.PDFUA_2]: {
        [languageEnum.Technical]: errorMap_pdfua_technical,
    },
    [errorProfiles.PDFUA_2_TAGGED_PDF]: {
        [languageEnum.Technical]: {
            ...errorMap_pdfua_technical,
            ...errorMap_tagged_technical,
        },
    },
};

function Tree({
    tagsNames,
    ruleSummaries,
    expandedRules,
    selectedGroup,
    expandedGroups,
    onExpandRule,
    onExpandGroup,
    selectedCheck,
    setSelectedCheck,
    setSelectedGroup,
    errorsMap,
    ruleSummariesFiltered,
    setRuleSummariesFiltered,
    profile,
}) {
    const [language, setLanguage] = useState(getItem(LS_ERROR_MESSAGES_LANGUAGE) || languageEnum.English);
    const [anchorMenuEl, setAnchorMenuEl] = useState(null);
    const [anchorFilterEl, setAnchorFilterEl] = useState(null);
    const [selectedTags, setSelectedTags] = useState(TAGS_NAMES);
    const [expandedCategory, setExpandedCategory] = useState([]);
    const [dictOfRules, setDictOfRules] = useState({}); // { [tagNames]: factorizedSummaries }
    const [groupWithRulesMap, setGroupWithRulesMap] = useState({}); // { [indexes]: tagNames }
    const prevSelectedCheck = usePrevious(selectedCheck);

    const onRuleFilter = useCallback(
        filteredTags => {
            if (!filteredTags.length) {
                setRuleSummariesFiltered([]);
                return;
            }
            const ruleSummariesFiltered = _.map(ruleSummaries, rule => {
                return _.intersection(rule.tags, filteredTags).length ? rule : null;
            });
            setRuleSummariesFiltered(ruleSummariesFiltered);
        },
        [ruleSummaries, setRuleSummariesFiltered]
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
            if (sortedCheckIndex === selectedCheck) {
                scrollToActiveBbox();
            }
        },
        [errorsMap, selectedCheck, setSelectedCheck]
    );

    // info dialog props
    const [openedRule, setOpenedRule] = useState(UNSELECTED);
    const [infoDialogOpened, setInfoDialogOpened] = useState(false);
    const errorMessages = useMemo(() => {
        switch (profile) {
            case errorProfiles.TAGGED_PDF:
            case errorProfiles.PDFUA_2:
            case errorProfiles.PDFUA_2_TAGGED_PDF:
                return errorMessagesMap[profile][language];
            default:
                return errorMessagesMap[errorProfiles.OTHER][language];
        }
    }, [language, profile]);
    const availableGroups = useMemo(() => getAvailableGroups(tagsNames, errorTags), [tagsNames]);

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
    const handleFilterClick = useCallback(event => {
        setAnchorFilterEl(event.currentTarget);
    }, []);
    const handleClose = useCallback(() => {
        setAnchorFilterEl(null);
    }, []);

    useEffect(() => {
        const newExpandedCategory = [...errorTags[selectedGroup], { name: LIST_OTHERS }];
        setExpandedCategory(newExpandedCategory);
        const [newDictOfRules, newGroupWithRulesMap] = getFactorizedRules(
            ruleSummariesFiltered,
            errorTags[selectedGroup].map(({ name }) => name)
        );
        setDictOfRules(newDictOfRules);
        setGroupWithRulesMap(newGroupWithRulesMap);
    }, [ruleSummariesFiltered, selectedGroup]);

    useEffect(() => {
        if (!_.isNil(selectedCheck) && selectedCheck !== prevSelectedCheck) {
            const ruleIndex = errorsMap[selectedCheck]?.ruleIndex;
            const groupIndex = expandedCategory.findIndex(({ name }) => name === groupWithRulesMap[ruleIndex]);
            onExpandGroup(groupIndex, false);
            onExpandRule(ruleIndex, false);
        }
    }, [errorsMap, selectedCheck, prevSelectedCheck, onExpandGroup, onExpandRule, groupWithRulesMap, expandedCategory]);

    return (
        <section className="summary-tree">
            <List
                className="summary-tree__list"
                aria-labelledby="summary-tree-subheader"
                subheader={
                    <ListSubheader component="div" id="summary-tree-subheader" disableSticky>
                        {LIST_HEADER}
                        <Tooltip title={FILTER_TOOLTIP}>
                            <IconButton
                                size="small"
                                onClick={handleFilterClick}
                                disabled={_.isNil(tagsNames) || tagsNames.length === 0}
                            >
                                <FilterListIcon />
                            </IconButton>
                        </Tooltip>
                        <Popover
                            open={!!anchorFilterEl}
                            anchorEl={anchorFilterEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                        >
                            <FilterPopup
                                groups={availableGroups}
                                tagsNames={tagsNames}
                                selectedTags={selectedTags}
                                selectedGroup={selectedGroup}
                                setSelectedGroup={setSelectedGroup}
                                setSelectedTags={setSelectedTags}
                                anchorEl={anchorFilterEl}
                                setAnchorEl={setAnchorFilterEl}
                                onFilter={onRuleFilter}
                            />
                        </Popover>
                        <Tooltip title={language}>
                            <IconButton size="small" onClick={handleLanguageClick}>
                                <LanguageIcon />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            id="language-menu"
                            anchorEl={anchorMenuEl}
                            keepMounted
                            open={!!anchorMenuEl}
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
                disablePadding
            >
                <div className="summary-tree__list__item">
                    <GroupList
                        expandedCategory={expandedCategory}
                        dictOfRules={dictOfRules}
                        tagsNames={tagsNames}
                        ruleSummaries={ruleSummariesFiltered}
                        expandedRules={expandedRules}
                        expandedGroups={expandedGroups}
                        selectedCheck={selectedCheck}
                        onGroupClick={onExpandGroup}
                        onRuleClick={onExpandRule}
                        onCheckClick={onCheckClick}
                        onInfoClick={onInfoClick}
                        errorsMap={errorsMap}
                        errorMessages={errorMessages}
                        selectedGroup={selectedGroup}
                    />
                </div>
            </List>
            {openedRule !== UNSELECTED && (
                <InfoDialog
                    title={`${getRuleNumber(openedRule, errorMessages)}${getRuleTitle(openedRule, errorMessages)}`}
                    tagsNames={openedRule?.tags || []}
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

function GroupList({
    expandedCategory,
    dictOfRules,
    tagsNames,
    ruleSummaries,
    expandedRules,
    expandedGroups,
    selectedCheck,
    onGroupClick,
    onRuleClick,
    onCheckClick,
    onInfoClick,
    errorsMap,
    errorMessages,
}) {
    return tagsNames?.length ? (
        !!ruleSummaries.filter(rule => rule !== null).length ? (
            expandedCategory?.map(({ name }, index) => {
                return dictOfRules[name] ? (
                    <Fragment key={name}>
                        <ListItem button onClick={() => onGroupClick(index)} className="group-item">
                            {expandedGroups.includes(index) ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                            <ListItemText
                                title={name}
                                className="rule-item__content"
                                primary={<span className="content-text">{name}</span>}
                            />
                        </ListItem>
                        {
                            <Collapse in={expandedGroups.includes(index)} timeout={0} unmountOnExit>
                                <List component="div" disablePadding>
                                    <RuleList
                                        ruleSummaries={dictOfRules[name]}
                                        expandedRules={expandedRules}
                                        selectedCheck={selectedCheck}
                                        onRuleClick={onRuleClick}
                                        onCheckClick={onCheckClick}
                                        onInfoClick={onInfoClick}
                                        errorsMap={errorsMap}
                                        errorMessages={errorMessages}
                                    />
                                </List>
                            </Collapse>
                        }
                    </Fragment>
                ) : null;
            })
        ) : (
            <ListItem>
                <ListItemText>{LIST_NO_ERRORS}</ListItemText>
            </ListItem>
        )
    ) : (
        <RuleList
            ruleSummaries={ruleSummaries}
            expandedRules={expandedRules}
            selectedCheck={selectedCheck}
            onRuleClick={onRuleClick}
            onCheckClick={onCheckClick}
            onInfoClick={onInfoClick}
            errorsMap={errorsMap}
            errorMessages={errorMessages}
        />
    );
}

// TODO: add Warnings
function RuleList({
    ruleSummaries,
    expandedRules,
    selectedCheck,
    onRuleClick,
    onCheckClick,
    onInfoClick,
    errorsMap,
    errorMessages,
}) {
    return ruleSummaries && !!ruleSummaries.filter(rule => rule !== null).length ? (
        ruleSummaries.map((rule, index) => {
            if (_.isNil(rule)) return null;
            const checks = rule.checks;
            const ruleTitle = getRuleTitle(rule, errorMessages);
            const checksLabel = `${checks.length}${rule.failedChecks > checks.length ? '+' : ''}`;
            return (
                <Fragment key={index}>
                    <ListItem
                        button
                        onClick={() => onRuleClick(index)}
                        className={classNames('rule-item rule-item_error', {
                            'rule-item_expanded': expandedRules.includes(index),
                        })}
                    >
                        {checks.length ? expandedRules.includes(index) ? <ExpandMoreIcon /> : <ChevronRightIcon /> : []}
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
                        <Collapse in={expandedRules.includes(index)} timeout={0} unmountOnExit>
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
        })
    ) : (
        <ListItem>
            <ListItemText>{LIST_NO_ERRORS}</ListItemText>
        </ListItem>
    );
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
        const checkTitle = getCheckTitle({ checkKey, index, allChecks: checksSorted, errorsMap, location });
        const errorTitle = errorMessage + '\n\nContext: ' + context;
        const error = errorsMap[selectedCheck];
        const isGrouped =
            selectedCheck &&
            error &&
            error?.groupId &&
            errorsMap[checkKey]?.groupId &&
            error.groupId.split('-')?.pop() === errorsMap[checkKey].groupId.split('-')?.pop() &&
            selectedCheck !== checkKey;
        return (
            <LI
                key={index}
                onClick={() => onCheckClick(checkKey)}
                selected={`${error?.ruleIndex}:${error?.checkIndex}:${error?.location || error?.context}` === checkKey}
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

function getCheckTitle({ checkKey, index, allChecks, errorsMap, location }) {
    const page = getPageNumber(checkKey, errorsMap);
    let pageString = page === UNSELECTED ? '' : `Page ${page}: `;

    if (location) {
        const bbox = JSON.parse(location)?.bbox;
        const firstPage = bbox[0]?.p + 1;
        const lastPage = bbox[bbox.length - 1]?.p + 1;
        if (firstPage !== lastPage) {
            pageString = page === UNSELECTED ? '' : `Pages ${firstPage}-${lastPage}: `;
        }
    }

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

function getFactorizedRules(ruleSummaries, keys) {
    const factorizedRules = {};
    const groupWithRulesMap = {};
    const otherIndexes = [];
    keys.forEach(key => {
        factorizedRules[key] = ruleSummaries.map((rule, index) => {
            if (_.isNil(rule)) return null;
            // Avoid duplicated rules in different categories
            const isRuleShow = rule.tags?.includes(key) && !otherIndexes.includes(index);
            if (isRuleShow) {
                groupWithRulesMap[index] = key;
                otherIndexes.push(index);
            }
            return isRuleShow ? rule : null;
        });
    });
    factorizedRules[LIST_OTHERS] = ruleSummaries.map((rule, index) => {
        const isRuleOther = !otherIndexes.includes(index);
        if (isRuleOther) {
            groupWithRulesMap[index] = LIST_OTHERS;
        }
        return isRuleOther ? rule : null;
    });
    // Mapping {null, ..., null} to null
    [...keys, LIST_OTHERS].forEach(key => {
        if (!factorizedRules[key].filter(rule => rule !== null).length) {
            factorizedRules[key] = null;
        }
    });
    return [factorizedRules, groupWithRulesMap];
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
    ruleSummariesFiltered: PropTypes.arrayOf(SummaryInterface).isRequired,
    profile: PropTypes.string.isRequired,
    tagsNames: PropTypes.arrayOf(PropTypes.string),
    selectedGroup: PropTypes.string.isRequired,
    selectedCheck: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    expandedGroups: PropTypes.arrayOf(PropTypes.number).isRequired,
    expandedRules: PropTypes.arrayOf(PropTypes.number).isRequired,
    setRuleSummariesFiltered: PropTypes.func.isRequired,
    setSelectedGroup: PropTypes.func.isRequired,
    setSelectedCheck: PropTypes.func.isRequired,
    onExpandRule: PropTypes.func.isRequired,
    onExpandGroup: PropTypes.func.isRequired,
    errorsMap: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
};

function mapStateToProps(state) {
    return {
        ruleSummaries: getRuleSummaries(state),
        tagsNames: getTags(state),
        profile: getProfile(state),
    };
}

export default connect(mapStateToProps)(Tree);
