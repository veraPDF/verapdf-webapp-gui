import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InputLabel from '@material-ui/core/InputLabel';
import { setSetting } from '../../../../../store/job/settings/actions';
import { getProfileOptions, getProfilesError } from '../../../../../store/validationProfiles/selectors';
import Select, { OptionShape } from '../../../../shared/select/Select';
import FatalErrorMessage from '../../../../shared/fatalError/FatalErrorMessage';

const PROFILE_LABEL = 'Validation profile';

const LOADING_TEXT = 'Loading profiles...';
const LOADING_OPTION = [{ label: LOADING_TEXT, value: LOADING_TEXT, disabled: true }];

function ProfileSelect({ profiles, selectedProfile, error, onChange }) {
    if (error) {
        return <FatalErrorMessage message={error} />;
    }

    let disabled = false;
    if (profiles.length === 0) {
        disabled = true;
        profiles = LOADING_OPTION;
        selectedProfile = LOADING_TEXT;
    }

    return (
        <Fragment>
            <InputLabel id="jobProfileLabel" className="job-settings__label">
                {PROFILE_LABEL}
            </InputLabel>
            <Select
                id="jobProfile"
                labelId="jobProfileLabel"
                className="job-settings__controller"
                options={profiles}
                value={selectedProfile}
                disabled={disabled}
                onChange={onChange}
            />
        </Fragment>
    );
}

ProfileSelect.propTypes = {
    profiles: PropTypes.arrayOf(OptionShape).isRequired,
    selectedProfile: PropTypes.string,
    error: PropTypes.string,
    onChange: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        profiles: getProfileOptions(state),
        selectedProfile: state.jobSettings.profile,
        error: getProfilesError(state),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onChange: value => dispatch(setSetting('profile', value)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileSelect);
