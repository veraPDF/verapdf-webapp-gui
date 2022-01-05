import { handleActions } from 'redux-actions';
import { USE_SETTINGS_FLAG } from '../constants';

const DEFAULT_STATE = {
    initialized: false,
    locked: false,
    useSettings: false,
};

export const getDefaultState = () => {
    let useSettings = sessionStorage.getItem(USE_SETTINGS_FLAG);

    if (!useSettings) {
        return DEFAULT_STATE;
    }

    useSettings = JSON.parse(useSettings);
    return {
        ...DEFAULT_STATE,
        useSettings,
    };
};

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        APP_STARTUP_FINISH: state => ({ ...state, initialized: true }),
        APP_LOCK_SET: (state, { payload: locked }) => ({ ...state, locked }),
        USE_SETTINGS_TOGGLE: state => {
            const useSettings = !state.useSettings;
            sessionStorage.setItem(USE_SETTINGS_FLAG, useSettings);
            return { ...state, useSettings };
        },
    },
    getDefaultState()
);
