const { REACT_APP_API_ROOT } = process.env;
//const FILE_API = `${REACT_APP_API_ROOT}/files`;

export const getInfo = () => {
    const url = `${REACT_APP_API_ROOT}/status/file-storage/info`;
    return fetch(url);
};
