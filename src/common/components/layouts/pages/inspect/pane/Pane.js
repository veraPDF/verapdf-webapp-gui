import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';

import './Pane.scss';

function Pane({ isShow, setIsShow, isDisable }) {
    return (
        <Button
            className="pane"
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
