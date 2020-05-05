import { createAction } from 'redux-actions';

export const setJob = createAction('JOB_SET');

export const validate = () => async dispatch => {
    dispatch(setJob({}));
};
