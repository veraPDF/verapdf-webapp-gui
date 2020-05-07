import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import { JOB_FILE, JOB_STATUS } from './constants';
import { finishAppStartup } from './application/actions';
import { updateServerStatus } from './serverInfo/actions';
import { addPdfFile } from './pdfFiles/actions';
import { updateProfiles } from './validationProfiles/actions';
import { getFile } from '../services/pdfStorage';
import { getJob } from '../services/jobService';
import { setJob, validate } from './job/actions';
import { getUnsavedFile } from './pdfFiles/selectors';
import { isLocked } from './application/selectors';

export default function configureStore() {
    const store = createStore(rootReducer, applyMiddleware(thunk));

    window.onbeforeunload = () => {
        // Show confirmation when we reload page while:
        // - selected PDF file is not saved for some reason (and thus cannot be restored)
        // - application is locked, e.g. when job creation was started but not yet complete (and thus cannot be restored)
        if (getUnsavedFile(store.getState()) || isLocked(store.getState())) {
            return '';
        }
    };

    const startupPromises = [];

    // Check server availability
    store.dispatch(updateServerStatus());

    // Restore PDF file if there is any saved in DB
    const restoreFilesPromise = restoreFiles(store);
    if (restoreFilesPromise) {
        startupPromises.push(restoreFilesPromise);
    }

    // Retrieve job information if needed
    const jobId = parseJobId();
    if (jobId) {
        startupPromises.push(restoreJob(store, jobId, restoreFilesPromise));
    }

    // Get validationProfiles list
    store.dispatch(updateProfiles());

    if (startupPromises.length > 0) {
        Promise.all(startupPromises).then(() => {
            store.dispatch(finishAppStartup());
        });
    } else {
        store.dispatch(finishAppStartup());
    }

    return store;
}

const restoreFiles = store => {
    const fileName = sessionStorage.getItem(JOB_FILE);
    if (!fileName) {
        return null;
    }

    return getFile(fileName).then(file => {
        if (file?.size) {
            store.dispatch(addPdfFile({ file, hasBackup: true }));
        } else {
            sessionStorage.removeItem(JOB_FILE);
        }
    });
};

const restoreJob = (store, id, fileRestored) =>
    getJob(id)
        .then(async job => {
            store.dispatch(setJob(job));
            if (job.status === JOB_STATUS.CREATED) {
                const completedSteps = ['JOB_CREATE'];
                if (job.tasks && job.tasks.length > 0) {
                    // TODO: also restore file id or even the whole file object (in case there is no restored from IndexedDB or the job references different file)
                    completedSteps.push('FILE_UPLOAD', 'JOB_UPDATE');
                } else {
                    // We will need to upload file, wait until it is restored from IndexedDB
                    if (fileRestored) {
                        await fileRestored;
                    } else {
                        throw Error('File cannot be restored');
                    }
                }
                store.dispatch(validate(completedSteps));
            }
        })
        .catch(() => {
            // TODO: distinguish cases when error code is 404 and other
            store.dispatch(setJob({ status: JOB_STATUS.NOT_FOUND }));
        });

const parseJobId = () => {
    const { PUBLIC_URL } = process.env;
    const JOB_URL_REGEXP = new RegExp(`^${PUBLIC_URL}/jobs/([^/]+)/.*`);
    const match = JOB_URL_REGEXP.exec(window.location.pathname);
    if (!match) {
        return undefined;
    }
    return match[1];
};
