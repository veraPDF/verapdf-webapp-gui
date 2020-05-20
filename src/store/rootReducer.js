import { combineReducers } from 'redux';
import serverInfo from './serverInfo/reducer';
import pdfFiles from './pdfFiles/reducer';
import job from './job/reducer';
import validationProfiles from './validationProfiles/reducer';
import jobSettings from './job/settings/reducer';
import jobProgress from './job/progress/reducer';
import appState from './application/reducer';

export default combineReducers({
    appState,
    serverInfo,
    pdfFiles,
    validationProfiles,
    job,
    jobSettings,
    jobProgress,
});
