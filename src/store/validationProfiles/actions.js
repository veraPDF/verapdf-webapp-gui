import { createAction } from 'redux-actions';
import { getList as getProfilesList } from '../../services/profiles';

const ERROR_TEXT = 'Failed to load validations profiles. You can try to refresh the page or return later.';

export const setProfiles = createAction('PROFILES_SET');

export const updateProfiles = () => async dispatch => {
    let profiles;

    let response = await getProfilesList();
    if (response.ok) {
        profiles = await response.json();
    } else {
        profiles = { error: ERROR_TEXT };
    }

    dispatch(setProfiles(profiles));
};
