import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import './Pane.scss';

const paneClasses = makeStyles({
    root: {
        minWidth: 0,
        borderRadius: 0,
    },
});

function Pane({ isShow, setIsShow, isDisable }) {
    const classes = paneClasses();
    return (
        <Button
            className="pane"
            classes={{
                root: classes.root,
            }}
            variant="outlined"
            color="primary"
            onClick={() => setIsShow(!isShow)}
            disabled={isDisable || false}
        >
            {isShow ? <ArrowRightIcon /> : <ArrowLeftIcon />}
        </Button>
    );
}

Pane.propTypes = {
    isShow: PropTypes.bool.isRequired,
    isDisable: PropTypes.bool.isRequired,
    setIsShow: PropTypes.func.isRequired,
};

export default Pane;
