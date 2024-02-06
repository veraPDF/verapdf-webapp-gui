import { createAction } from 'redux-actions';
import { getFile, getFileId } from '../pdfFiles/selectors';
import { getFileLink } from '../pdfLink/selectors';
import { getJob, getJobId, getTaskErrorMessage, getTaskResultId, getTaskStatus } from './selectors';
import * as JobService from '../../services/jobService';
import * as FileService from '../../services/fileService';
import { updatePdfFile, storeFile } from '../pdfFiles/actions';
import { setResult } from './result/actions';
import { lockApp, unlockApp } from '../application/actions';
import { getProfile } from './settings/selectors';
import { cancelJob, finishStep, startStep } from './progress/actions';
import { JOB_STATUS, TASK_STATUS } from '../constants';
import { isFileUploadMode } from '../application/selectors';

export const setJob = createAction('JOB_SET');

// TODO: cancel validation on app reset
// https://github.com/veraPDF/verapdf-webapp-gui/issues/36
export const validate = (completedSteps = []) => async (dispatch, getState) => {
    try {
        await createJob(dispatch, getState, completedSteps);
        await uploadPdfFile(dispatch, getState, completedSteps);
        await addTask(dispatch, getState, completedSteps);
        await startJob(dispatch, getState, completedSteps);
        await waitToStart(dispatch, getState, completedSteps);
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
    if (taskStatus !== TASK_STATUS.CANCELLED) {
        const resultFileId = getTaskResultId(getState());
        const validationResult = await FileService.getFileContent(resultFileId);
        dispatch(
            setResult(
                validationResult.hasOwnProperty('validationResult')
                    ? validationResult.validationResult
                    : validationResult
            )
        );
    } else {
        dispatch(setResult({ jobEndStatus: 'cancelled' }));
    }
};

export const cancelValidation = () => async (dispatch, getState) => {
    const jobId = getJobId(getState());
    dispatch(cancelJob());
    try {
        await JobService.cancelJob(jobId);
    } catch (error) {
        console.error(error);
    }
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
    if (isFileUploadMode(getState())) {
        const file = getFile(getState());
        const fileDescriptor = await FileService.uploadFile(file);
        dispatch(updatePdfFile(fileDescriptor));
    } else {
        const link = getFileLink(getState());
        const fileDescriptor = await FileService.uploadLink(link);
        if (fileDescriptor.contentType !== 'application/pdf') {
            throw new Error('Content type is not application/pdf');
        }
        const blob = await FileService.getFileContent(fileDescriptor.id);
        const file = new File([blob], fileDescriptor.fileName);
        await dispatch(storeFile(file));
        dispatch(updatePdfFile(fileDescriptor));
    }
});

const addTask = createStep('JOB_UPDATE', 10, async (dispatch, getState) => {
    const fileId = getFileId(getState());
    const jobParams = {
        ...getJob(getState()),
        tasks: [{ fileId: fileId }],
    };
    const job = await JobService.updateJob(jobParams);
    dispatch(setJob(job));
});

const startJob = createStep('JOB_EXECUTE', 10, async (dispatch, getState) => {
    const jobId = getJobId(getState());
    const job = await JobService.executeJob(jobId);
    dispatch(setJob(job));
});

const waitToStart = createStep(
    'JOB_WAITING',
    10,
    (dispatch, getState) =>
        new Promise((resolve, reject) => {
            const REFRESH_INTERVAL = 1000;
            const checkStatus = () =>
                setTimeout(async () => {
                    const jobId = getJobId(getState());
                    const job = await JobService.getJob(jobId);
                    dispatch(setJob(job));
                    if (job.status === JOB_STATUS.WAITING) {
                        checkStatus();
                    } else {
                        if (
                            job.status === JOB_STATUS.PROCESSING ||
                            job.status === JOB_STATUS.CANCELLED ||
                            getTaskStatus(getState()) === TASK_STATUS.FINISHED
                        ) {
                            resolve();
                        } else {
                            reject(new Error(getTaskErrorMessage(getState())));
                        }
                    }
                }, REFRESH_INTERVAL);

            checkStatus();
        })
);

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
                    dispatch(setJob(job));
                    if (job.status === JOB_STATUS.PROCESSING) {
                        checkStatus();
                    } else {
                        if (
                            getTaskStatus(getState()) === TASK_STATUS.FINISHED ||
                            getTaskStatus(getState()) === TASK_STATUS.CANCELLED
                        ) {
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
