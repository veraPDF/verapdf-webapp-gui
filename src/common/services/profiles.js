import { get } from './api';

export const getList = () => {
    return get('/api/profiles');
};
