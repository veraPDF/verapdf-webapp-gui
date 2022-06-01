import { get } from './api';

const { REACT_APP_API_ROOT } = process.env;

export const getInfo = () => {
    const url = `${REACT_APP_API_ROOT}/status/worker/info`;
    return get(url);
};

export const getAppsBuildInfo = version => {
    const url = `${process.env.REACT_APP_APPS_ARTIFACTORY_URL}/${version}`;
    return get(url);
};
