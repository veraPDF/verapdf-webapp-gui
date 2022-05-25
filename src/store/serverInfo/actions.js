import { createAction } from 'redux-actions';
import { getInfo as getFileServiceInfo } from '../../services/fileService';
import { getInfo as getJobServiceInfo } from '../../services/jobService';
import { getInfo as getWorkerServiceInfo } from '../../services/workerService';

const buildServiceInfo = promise =>
    promise.then(({ build }) => ({ available: true, build })).catch(() => ({ available: false }));

const setServerInfo = createAction('SERVER_INFO_SET');

export const updateServerStatus = () => async dispatch => {
    const [fileService, jobService, workerService] = await Promise.all([
        buildServiceInfo(getFileServiceInfo()),
        buildServiceInfo(getJobServiceInfo()),
        buildServiceInfo(getWorkerServiceInfo()),
    ]);
    dispatch(setServerInfo({ fileService, jobService, workerService }));
};
