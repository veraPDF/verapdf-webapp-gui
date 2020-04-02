import { combineReducers } from 'redux';
import serverInfo from './serverInfo/reducer';
import pdfFiles from './pdfFiles/reducer';

export default combineReducers({
    serverInfo,
    pdfFiles,
});
