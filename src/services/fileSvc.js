//const FILE_API = '/api/files';

export const getInfo = () => {
    const url = '/api/status/file-storage/info';
    return fetch(url);
};
