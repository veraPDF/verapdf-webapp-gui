import { createAction } from 'redux-actions';

export const startStep = createAction('JOB_PROGRESS_STEP_START');
export const finishStep = createAction('JOB_PROGRESS_STEP_FINISH', (stepKey, percentage) => ({ stepKey, percentage }));
export const cancelJob = createAction('JOB_CANCEL');
