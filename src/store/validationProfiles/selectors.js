import { createSelector } from 'reselect';
import _ from 'lodash';

const getProfiles = state => state.validationProfiles;

export const getProfileOptions = createSelector(getProfiles, profiles => {
    if (!Array.isArray(profiles)) {
        return [];
    }
    return profiles.map(profile => ({
        label: profile.humanReadableName,
        value: profile.profileName,
        disabled: !profile.available,
    }));
});

export const getProfilesError = createSelector(getProfiles, profiles => _.get(profiles, 'error'));
