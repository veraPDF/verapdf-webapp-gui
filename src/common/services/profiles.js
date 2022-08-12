import { get } from './api';

const { REACT_APP_API_ROOT } = process.env;

export const getList = () => {
    return get(`${REACT_APP_API_ROOT}/profiles`);
};
