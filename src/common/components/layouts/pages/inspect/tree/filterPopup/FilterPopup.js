import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import ClearIcon from '@material-ui/icons/Clear';
import classNames from 'classnames';

import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Chip from '@material-ui/core/Chip';

import { errorTags, GROUPS, TAGS_NAMES } from '../../constants';

import './FilterPopup.scss';

const TEXT = 'Group by';
const SELECT = 'Show all';
const CLEAR = 'Hide all';

const FilterPopup = ({ onFilter, selectedTags, setSelectedTags, selectedGroup, setSelectedGroup }) => {
    const groupsItems = useMemo(() => {
        return GROUPS.map(group => (
            <MenuItem key={group} value={group}>
                {group}
            </MenuItem>
        ));
    }, []);

    const handleClear = useCallback(() => {
        setSelectedTags([]);
        onFilter([]);
    }, [onFilter, setSelectedTags]);
    const handleSelect = useCallback(() => {
        setSelectedTags(TAGS_NAMES);
        onFilter(TAGS_NAMES);
    }, [onFilter, setSelectedTags]);
    const handleGroup = useCallback(
        ({ target }) => {
            setSelectedGroup(target.value);
        },
        [setSelectedGroup]
    );
    const selectTag = useCallback(
        selectedTag => {
            const newSelectedTags = selectedTags.includes(selectedTag)
                ? [...selectedTags.filter(tag => tag !== selectedTag)]
                : [...selectedTags, selectedTag];
            setSelectedTags(newSelectedTags);
            onFilter(newSelectedTags);
        },
        [onFilter, selectedTags, setSelectedTags]
    );

    return (
        <div className="popup">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle1" component="span">
                    {TEXT}
                </Typography>
                <FormControl className="popup__select">
                    <Select
                        value={selectedGroup}
                        onChange={handleGroup}
                        MenuProps={{
                            getContentAnchorEl: null,
                        }}
                    >
                        {groupsItems}
                    </Select>
                </FormControl>
            </Box>
            <div className="popup__buttons">
                <Tooltip title={SELECT}>
                    <IconButton size="small" onClick={handleSelect}>
                        <SelectAllIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title={CLEAR}>
                    <IconButton size="small" onClick={handleClear}>
                        <ClearIcon />
                    </IconButton>
                </Tooltip>
            </div>
            <List className="popup__tagsPane">
                {GROUPS.map(group => (
                    <div key={group}>
                        <Typography className="popup__tagsTitle" component="span">
                            {group}
                        </Typography>
                        <Paper component="ul" className="popup__tags">
                            {errorTags[group].map(({ name, description }, index) => {
                                return (
                                    <li key={index}>
                                        <Tooltip title={description} placement="top">
                                            <Chip
                                                className={classNames('popup__tags__tag', {
                                                    popup__tags__tag__selected: selectedTags.includes(name),
                                                })}
                                                color="primary"
                                                variant={selectedTags.includes(name) ? 'default' : 'outlined'}
                                                label={name}
                                                onClick={() => selectTag(name)}
                                            />
                                        </Tooltip>
                                    </li>
                                );
                            })}
                        </Paper>
                    </div>
                ))}
            </List>
        </div>
    );
};

FilterPopup.propTypes = {
    onFilter: PropTypes.func.isRequired,
    selectedGroup: PropTypes.string.isRequired,
    selectedTags: PropTypes.arrayOf(PropTypes.string),
    setSelectedGroup: PropTypes.func.isRequired,
    setSelectedTags: PropTypes.func.isRequired,
};

export default FilterPopup;
