import { createAction } from 'redux-actions';
import { getFile, getFileId } from '../pdfFiles/selectors';
import { getJob, getJobId, getTaskErrorMessage, getTaskResultId, getTaskStatus } from './selectors';
import * as JobService from '../../services/jobService';
import * as FileService from '../../services/fileService';
import { updatePdfFile } from '../pdfFiles/actions';
import { setResult } from './result/actions';
import { lockApp, unlockApp } from '../application/actions';
import { getProfile } from './settings/selectors';
import { finishStep, startStep } from './progress/actions';
import { JOB_STATUS, TASK_STATUS } from '../constants';

export const setJob = createAction('JOB_SET');

// TODO: cancel validation on app reset
// https://github.com/veraPDF/verapdf-webapp-gui/issues/36
export const validate = (completedSteps = []) => async (dispatch, getState) => {
    try {
        await createJob(dispatch, getState, completedSteps);
        await uploadPdfFile(dispatch, getState, completedSteps);
        await addTask(dispatch, getState, completedSteps);
        await startJob(dispatch, getState, completedSteps);
        await waitForComplete(dispatch, getState, completedSteps);
        await downloadValidationResult(dispatch, getState, completedSteps);
    } catch (error) {
        console.error(error);
        dispatch(
            setJob({
                ...getJob(getState()),
                status: JOB_STATUS.ERROR,
                errorMessage: error.message,
            })
        );
    }
};

export const loadValidationResult = async (dispatch, getState) => {
    const taskStatus = getTaskStatus(getState());
    if (taskStatus === TASK_STATUS.ERROR) {
        throw new Error(getTaskErrorMessage(getState()));
    }
    const resultFileId = getTaskResultId(getState());
    const validationResult = await FileService.getFileContent(resultFileId);
    dispatch(setResult(validationResult));
};

const createStep = (key, percentage = 0, stepFn) => async (dispatch, getState, completedSteps) => {
    dispatch(startStep(key));

    if (!completedSteps.includes(key)) {
        await stepFn(dispatch, getState);
    }

    dispatch(finishStep(key, percentage));
};

const createJob = createStep('JOB_CREATE', 10, async (dispatch, getState) => {
    // Lock application to display confirmation if user tries to leave the page before job creation is complete
    dispatch(lockApp(true));
    try {
        const profile = getProfile(getState());
        const job = await JobService.createJob({ profile });
        dispatch(setJob(job));
    } finally {
        // Unlock application, user should be able to leave the page now
        dispatch(unlockApp());
    }
});

const uploadPdfFile = createStep('FILE_UPLOAD', 30, async (dispatch, getState) => {
    const file = getFile(getState());
    const fileDescriptor = await FileService.uploadFile(file);
    dispatch(updatePdfFile(fileDescriptor));
});

const addTask = createStep('JOB_UPDATE', 10, async (dispatch, getState) => {
    const fileId = getFileId(getState());
    let job = {
        ...getJob(getState()),
        tasks: [{ fileId }],
    };
    job = await JobService.updateJob(job);
    dispatch(setJob(job));
});

const startJob = createStep('JOB_EXECUTE', 10, async (dispatch, getState) => {
    const jobId = getJobId(getState());
    const job = await JobService.executeJob(jobId);
    dispatch(setJob(job));
});

const waitForComplete = createStep(
    'JOB_COMPLETE',
    35,
    (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const REFRESH_INTERVAL = 1000;
            const checkStatus = () =>
                setTimeout(async () => {
                    const jobId = getJobId(getState());
                    const job = await JobService.getJob(jobId);

                    if (job.status === JOB_STATUS.PROCESSING) {
                        checkStatus();
                    } else {
                        dispatch(setJob(job));
                        if (getTaskStatus(getState()) === TASK_STATUS.FINISHED) {
                            resolve();
                        } else {
                            reject(new Error(getTaskErrorMessage(getState())));
                        }
                    }
                }, REFRESH_INTERVAL);

            checkStatus();
        })
);

const downloadValidationResult = createStep('VALIDATION_RESULT_DOWNLOAD', 5, loadValidationResult);
