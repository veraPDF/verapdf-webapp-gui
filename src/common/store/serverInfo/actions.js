import { createAction } from 'redux-actions';
import { getInfo as getFileServiceInfo } from '../../services/fileService';
import { getInfo as getJobServiceInfo } from '../../services/jobService';
import { getInfo as getWorkerServiceInfo, getAppsBuildInfo } from '../../services/workerService';

const buildServiceInfo = promise =>
    promise.then(({ build }) => ({ available: true, build })).catch(() => ({ available: false }));

const buildAppsInfo = promise =>
    promise.then(info => ({ available: true, ...info })).catch(() => ({ available: false }));

const extendWorkerServiceInfo = async workerService => {
    if (!workerService.available) {
        return;
    }
    if (workerService.build && workerService.build.apps && workerService.build.apps.version) {
        const appsInfo = await buildAppsInfo(getAppsBuildInfo(workerService.build.apps.version));
        if (appsInfo.available && appsInfo.lastUpdated) {
            workerService.build.apps = {
                ...workerService.build.apps,
                lastUpdated: appsInfo.lastUpdated,
            };
        }
    }
};

const setServerInfo = createAction('SERVER_INFO_SET');

export const updateServerStatus = () => async dispatch => {
    const [fileService, jobService, workerService] = await Promise.all([
        buildServiceInfo(getFileServiceInfo()),
        buildServiceInfo(getJobServiceInfo()),
        buildServiceInfo(getWorkerServiceInfo()),
    ]);
    dispatch(setServerInfo({ fileService, jobService, workerService }));
};

export const updateWorkerServiceStatus = () => async dispatch => {
    const workerService = await buildServiceInfo(getWorkerServiceInfo());
    await extendWorkerServiceInfo(workerService);
    dispatch(setServerInfo({ workerService }));
};
