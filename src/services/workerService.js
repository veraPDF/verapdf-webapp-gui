import { get } from './api';

const { REACT_APP_API_ROOT } = process.env;

export const getInfo = () => {
    const url = `${REACT_APP_API_ROOT}/status/worker/info`;
    return get(url);
};
