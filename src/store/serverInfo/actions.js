import { createAction } from 'redux-actions';
import { getInfo as getFileServiceInfo } from '../../services/fileService';
import { getInfo as getJobServiceInfo } from '../../services/jobService';

const buildServiceInfo = promise =>
    promise.then(({ build }) => ({ available: true, build })).catch(() => ({ available: false }));

const setServerInfo = createAction('SERVER_INFO_SET');

export const updateServerStatus = () => async dispatch => {
    const [fileService, jobService] = await Promise.all([
        buildServiceInfo(getFileServiceInfo()),
        buildServiceInfo(getJobServiceInfo()),
    ]);
    dispatch(setServerInfo({ fileService, jobService }));
};
