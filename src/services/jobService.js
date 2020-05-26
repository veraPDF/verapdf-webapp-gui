import { get, post, put } from './api';
const { REACT_APP_API_ROOT } = process.env;

export const getInfo = () => {
    return get(`${REACT_APP_API_ROOT}/status/job-service/info`);
};

export const getJob = id => {
    const url = `${REACT_APP_API_ROOT}/jobs/${id}`;
    return get(url);
};

export const createJob = job => {
    const url = `${REACT_APP_API_ROOT}/jobs`;
    return post(url, job);
};

export const updateJob = job => {
    const url = `${REACT_APP_API_ROOT}/jobs/${job.id}`;
    return put(url, job);
};

export const executeJob = id => {
    return post(`${REACT_APP_API_ROOT}/jobs/${id}/execution`);
};
