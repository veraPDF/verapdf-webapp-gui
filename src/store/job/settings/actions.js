import { createAction } from 'redux-actions';
import { JOB_SETTINGS } from '../../constants';
import { getDefaultProfileName } from '../../validationProfiles/selectors';

const updateSettings = createAction('SETTINGS_UPDATE');

export const setSetting = (setting, value) => async (dispatch, getState) => {
    await dispatch(updateSettings({ [setting]: value }));
    sessionStorage.setItem(JOB_SETTINGS, JSON.stringify(getState().jobSettings));
};

export const resetProfile = () => async (dispatch, getState) => {
    const profile = getDefaultProfileName(getState());
    dispatch(updateSettings({ profile }));
};
