import { createAction } from 'redux-actions';
import { JOB_SETTINGS } from '../../constants';

const updateSettings = createAction('SETTINGS_UPDATE');

export const setSetting = (setting, value) => async (dispatch, getState) => {
    await dispatch(updateSettings({ [setting]: value }));
    sessionStorage.setItem(JOB_SETTINGS, JSON.stringify(getState().jobSettings));
};
