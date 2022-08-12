import { createSelector } from 'reselect';
import _ from 'lodash';

const getProfiles = state => state.validationProfiles;

export const getProfileOptions = createSelector(getProfiles, profiles => {
    if (!Array.isArray(profiles)) {
        return [];
    }
    return profiles
        .filter(({ enabled }) => enabled)
        .map(profile => ({
            label: profile.humanReadableName,
            value: profile.profileName,
        }));
});

export const getDefaultProfileName = createSelector(getProfiles, profiles => _.first(profiles)?.profileName);

export const getProfilesError = createSelector(getProfiles, profiles => _.get(profiles, 'error'));
