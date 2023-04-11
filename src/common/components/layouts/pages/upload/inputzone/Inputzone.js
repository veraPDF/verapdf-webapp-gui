import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';
import * as pdfLink from '../../../../../store/pdfLink/actions';
import './Inputzone.scss';

const INPUTZONE_TEXT = 'URL';
const INVALID_URL = 'Invalid URL';

function Inputzone({ error, link, setLink, setError }) {
    useEffect(() => {
        setError(!isValidUrl(link));
    }, [link, setError]);
    const onChange = ({ target }) => {
        setLink(target.value);
    };
    const isValidUrl = url => {
        let newUrl;
        try {
            newUrl = new URL(url);
        } catch (e) {
            return false;
        }
        return (
            (newUrl.protocol === 'http:' || newUrl.protocol === 'https:') &&
            newUrl.pathname?.length > 5 &&
            newUrl.pathname.slice(-4) === '.pdf'
        );
    };
    return (
        <section className="inputzone">
            <div className="inputzone__container">
                <TextField
                    label={INPUTZONE_TEXT}
                    fullWidth
                    value={link}
                    onChange={onChange}
                    error={error}
                    helperText={link.length && error ? INVALID_URL : null}
                />
            </div>
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
        link: state.pdfLink.link,
        error: state.pdfLink.error,
    };
};
const mapDispatchToProps = dispatch => {
    return {
        setLink: link => dispatch(pdfLink.setLink(link)),
        setError: error => dispatch(pdfLink.setError(error)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Inputzone);
