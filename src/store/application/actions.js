import { createAction } from 'redux-actions';

export const finishAppStartup = createAction('APP_STARTUP_FINISH');

export const lockApp = createAction('APP_LOCK_SET', () => true);

export const unlockApp = createAction('APP_LOCK_SET', () => false);
