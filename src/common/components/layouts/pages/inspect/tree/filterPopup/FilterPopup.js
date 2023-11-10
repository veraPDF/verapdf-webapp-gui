import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import SelectAllIcon from '@material-ui/icons/SelectAll';
import RefreshIcon from '@material-ui/icons/Refresh';

import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import './FilterPopup.scss';

const TIMEOUT = 200;
const TEXT = 'Filter errors';
const APPLY = 'Apply';
const CANCEL = 'Cancel';
const SELECT = 'Select all';
const CLEAR = 'Clear all';
const ZONES = ['Show tags', 'Hide tags'];

const FilterPopup = ({ isOpen, setIsOpen, tags, onFilter }) => {
    const [selectedZone, setSelectedZone] = useState(ZONES[0]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [appliedTags, setAppliedTags] = useState({
        enabled: true,
        filteredTags: [],
    });

    const buttons = useMemo(() => {
        return ZONES.map(zone => (
            <ToggleButton key={zone} value={zone}>
                {zone}
            </ToggleButton>
        ));
    }, []);

    const handleZone = useCallback(
        (_event, zone) => {
            zone !== null && setSelectedZone(zone);
        },
        [setSelectedZone]
    );
    const handleClear = useCallback(() => {
        setSelectedZone(ZONES[0]);
        setSelectedTags([]);
    }, [setSelectedZone, setSelectedTags]);
    const handleSelect = useCallback(() => {
        setSelectedTags(tags);
    }, [tags, setSelectedTags]);
    const handleCancel = useCallback(() => {
        setIsOpen(false);
        setSelectedZone(ZONES[+!appliedTags.enabled]);
        setSelectedTags(appliedTags.filteredTags);
    }, [appliedTags, setIsOpen, setSelectedZone, setSelectedTags]);
    const handleApply = useCallback(() => {
        const newAppliedTags = {
            enabled: selectedZone === ZONES[0],
            filteredTags: selectedTags,
        };
        setIsOpen(false);
        setAppliedTags(newAppliedTags);
        onFilter(newAppliedTags);
    }, [onFilter, selectedTags, selectedZone, setIsOpen, setAppliedTags]);
    const selectTag = useCallback(
        category => {
            selectedTags.includes(category)
                ? setSelectedTags([...selectedTags.filter(tag => tag !== category)])
                : setSelectedTags([...selectedTags, category]);
        },
        [selectedTags, setSelectedTags]
    );

    return (
        <Modal
            className="popup"
            open={isOpen}
            onClose={handleCancel}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: TIMEOUT }}
        >
            <Fade in={isOpen}>
                <div className="popup__paper">
                    <Typography variant="h4" component="span">
                        {TEXT}
                    </Typography>
                    <Box className="popup__toggle" display="flex" justifyContent="center">
                        <ToggleButtonGroup size="small" value={selectedZone} exclusive onChange={handleZone}>
                            {buttons}
                        </ToggleButtonGroup>
                    </Box>
                    <div className="popup__wrapper">
                        <List className="popup__grid" component="div">
                            {tags?.map(category => (
                                <Button
                                    key={category}
                                    className="popup__grid__cell"
                                    variant={selectedTags.includes(category) ? 'contained' : 'outlined'}
                                    color="primary"
                                    onClick={() => selectTag(category)}
                                >
                                    {category}
                                </Button>
                            ))}
                        </List>
                    </div>
                    <div className="popup__buttons">
                        <Tooltip title={SELECT}>
                            <IconButton size="small" onClick={handleSelect}>
                                <SelectAllIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={CLEAR}>
                            <IconButton size="small" onClick={handleClear}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Button variant="outlined" color="primary" onClick={handleCancel}>
                            {CANCEL}
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleApply}>
                            {APPLY}
                        </Button>
                    </div>
                </div>
            </Fade>
        </Modal>
    );
};

FilterPopup.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsOpen: PropTypes.func.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    onFilter: PropTypes.func.isRequired,
};

export default FilterPopup;
