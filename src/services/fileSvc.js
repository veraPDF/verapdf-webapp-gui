const FILE_API = '/api/file';

export const getInfo = () => {
    const url = `${FILE_API}/status/info`;
    return fetch(url);
};
