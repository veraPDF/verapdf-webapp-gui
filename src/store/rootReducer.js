import { combineReducers } from 'redux';
import serverInfo from './serverInfo/reducer';
import pdfFiles from './pdfFiles/reducer';
import validationProfiles from './validationProfiles/reducer';
import jobSettings from './job/settings/reducer';

export default combineReducers({
    serverInfo,
    pdfFiles,
    validationProfiles,
    jobSettings,
});
