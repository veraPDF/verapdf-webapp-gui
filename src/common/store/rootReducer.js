import { combineReducers } from 'redux';
import serverInfo from './serverInfo/reducer';
import pdfFiles from './pdfFiles/reducer';
import job from './job/reducer';
import validationProfiles from './validationProfiles/reducer';
import jobSettings from './job/settings/reducer';
import jobProgress from './job/progress/reducer';
import taskResult from './job/result/reducer';
import appState from './application/reducer';
import pdfLink from './pdfLink/reducer';

export default combineReducers({
    appState,
    serverInfo,
    pdfFiles,
    validationProfiles,
    job,
    jobSettings,
    jobProgress,
    taskResult,
    pdfLink,
});
