import { useState, useMemo, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import './FilterPopup.scss';

const CELL_OUTLINE = 4;
const PRIMARY = '#cf3f4f';
const TIMEOUT = 300;
const TEXT = 'Filter errors';
const APPLY = 'APPLY';
const CANCEL = 'CANCEL';
const ZONES = ['Show tags', 'Hide tags'];

const useStyles = makeStyles(() => ({
    root: {
        borderRadius: 0,
        textTransform: 'none',
    },
    cell: {
        textTransform: 'capitalize',
        border: `1px solid ${PRIMARY}`,
        '&:hover': {
            background: 'transparent',
        },
    },
    selectedCell: {
        outlineOffset: `-${CELL_OUTLINE}px`,
        outline: `${CELL_OUTLINE}px solid ${PRIMARY}`,
    },
}));

const FilterPopup = ({ tags, onFilter }) => {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
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

    useEffect(() => {
        console.log(selectedTags);
    }, [selectedTags]);
    const handleZone = useCallback(
        (_event, zone) => {
            zone !== null && setSelectedZone(zone);
        },
        [setSelectedZone]
    );
    const handleCancel = useCallback(() => {
        setOpen(false);
        setSelectedZone(ZONES[+!appliedTags.enabled]);
        setSelectedTags(appliedTags.filteredTags);
    }, [appliedTags, setOpen, setSelectedZone, setSelectedTags]);
    const handleApply = useCallback(() => {
        const newAppliedTags = {
            enabled: selectedZone === ZONES[0],
            filteredTags: selectedTags,
        };
        setOpen(false);
        setAppliedTags(newAppliedTags);
        onFilter(newAppliedTags);
    }, [onFilter, selectedTags, selectedZone, setOpen, setAppliedTags]);
    const selectTag = useCallback(
        category => {
            selectedTags.includes(category)
                ? setSelectedTags([...selectedTags.filter(tag => tag !== category)])
                : setSelectedTags([...selectedTags, category]);
        },
        [selectedTags, setSelectedTags]
    );

    return (
        <>
            <Button
                className="summary-tree__filter"
                classes={{ root: classes.root }}
                variant="outlined"
                color="primary"
                onClick={() => setOpen(true)}
            >
                {TEXT}
            </Button>
            <Modal
                className="popup"
                open={open}
                onClose={handleCancel}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: TIMEOUT }}
            >
                <Fade in={open}>
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
                                {tags.map(category => (
                                    <ListItem
                                        key={category}
                                        classes={{
                                            root: `${classes.cell} ${
                                                selectedTags.includes(category) ? classes.selectedCell : ''
                                            }`,
                                        }}
                                        button
                                        onClick={() => selectTag(category)}
                                    >
                                        <ListItemText secondary={category} />
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                        <div className="popup__buttons">
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
        </>
    );
};

FilterPopup.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    onFilter: PropTypes.func.isRequired,
};

export default FilterPopup;
