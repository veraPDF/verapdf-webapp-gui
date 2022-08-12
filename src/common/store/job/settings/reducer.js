import { handleActions } from 'redux-actions';
import _ from 'lodash';
import { JOB_SETTINGS } from '../../constants';

const defaultState = {
    profile: undefined,
};

export const getDefaultState = () => {
    let storedSettings = sessionStorage.getItem(JOB_SETTINGS);

    if (!storedSettings) {
        return defaultState;
    }

    storedSettings = JSON.parse(storedSettings);
    return {
        ...defaultState,
        ...storedSettings,
    };
};

export default handleActions(
    {
        APP_RESET: (state, { payload: { profile } }) => ({ ...defaultState, profile }),
        SETTINGS_UPDATE: (state, { payload }) => ({ ...state, ...payload }),
        PROFILES_SET: (state, action) => {
            if (action.payload.error || !action.payload.length) {
                return state;
            }

            if (!state.profile || _.findIndex(action.payload, { profileName: state.profile }) === -1) {
                state.profile = action.payload[0].profileName;
            }

            return state;
        },
    },
    getDefaultState()
);
