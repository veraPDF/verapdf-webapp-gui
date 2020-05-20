import { createAction } from 'redux-actions';

export const startStep = createAction('JOB_PROGRESS_STEP_START');
export const finishStep = createAction('JOB_PROGRESS_STEP_FINISH', (stepKey, percentage) => ({ stepKey, percentage }));

// TODO: https://github.com/veraPDF/verapdf-webapp-gui/issues/17
//  call this action once job is complete
// const resetProgress = createAction('JOB_PROGRESS_RESET');
