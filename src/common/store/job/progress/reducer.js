import { handleActions } from 'redux-actions';

const DEFAULT_STATE = {
    steps: [],
    percentage: 0,
};

export default handleActions(
    {
        APP_RESET: () => DEFAULT_STATE,
        JOB_PROGRESS_STEP_START: (state, { payload: stepKey }) => ({
            ...state,
            steps: [...state.steps, { stepKey, completed: false }],
        }),
        JOB_PROGRESS_STEP_FINISH: (state, { payload: { stepKey, percentage } }) => ({
            ...state,
            percentage: state.percentage + percentage,
            steps: state.steps.map(step => {
                if (step.stepKey === stepKey) {
                    return { ...step, completed: true };
                }
                return step;
            }),
        }),
    },
    DEFAULT_STATE
);
