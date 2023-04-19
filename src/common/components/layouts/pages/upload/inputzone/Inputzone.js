import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import * as pdfLink from '../../../../../store/pdfLink/actions';
import { getFileLink, getFileError } from '../../../../../store/pdfLink/selectors';
import { isValidUrl } from '../../../../../services/fileService';
import './Inputzone.scss';
import classNames from 'classnames';

const INPUTZONE_TEXT = 'URL';
const INVALID_URL = 'Invalid URL';

function Inputzone({ error, link, setLink, setError }) {
    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(false);
    useEffect(() => {
        setError(!isValidUrl(link));
    }, [link, setError]);
    const onChange = ({ target }) => {
        setLink(target.value);
        setFilled(!!target.value.length);
    };
    return (
        <section className="inputzone">
            <TextField
                label={INPUTZONE_TEXT}
                fullWidth
                className={classNames('inputzone__container', {
                    _focused: focused,
                    _filled: filled,
                })}
                value={link}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={onChange}
                error={error && !!link?.length}
                helperText={error && link?.length ? INVALID_URL : null}
            />
        </section>
    );
}

Inputzone.propTypes = {
    link: PropTypes.string.isRequired,
    error: PropTypes.bool.isRequired,
    setLink: PropTypes.func.isRequired,
    setError: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        link: getFileLink(state),
        error: getFileError(state),
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setLink: link => dispatch(pdfLink.setLink(link)),
        setError: error => dispatch(pdfLink.setError(error)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inputzone);
