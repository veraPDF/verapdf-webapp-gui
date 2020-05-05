import { combineReducers } from 'redux';
import serverInfo from './serverInfo/reducer';
import pdfFiles from './pdfFiles/reducer';
import jobs from './job/reducer';
import validationProfiles from './validationProfiles/reducer';
import jobSettings from './job/settings/reducer';
import appState from './application/reducer';

export default combineReducers({
    appState,
    serverInfo,
    pdfFiles,
    validationProfiles,
    jobs,
    jobSettings,
});
