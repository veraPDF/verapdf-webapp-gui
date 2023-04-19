import WordArray from 'crypto-js/lib-typedarrays';
import md5 from 'crypto-js/md5';
import { get, upload } from './api';

const { REACT_APP_API_ROOT } = process.env;

export const getInfo = () => {
    const url = `${REACT_APP_API_ROOT}/status/file-storage/info`;
    return get(url);
};

export const uploadFile = async file => {
    const url = `${REACT_APP_API_ROOT}/files`;
    const data = await buildFileData(file);
    return upload(url, data);
};

export const uploadLink = async link => {
    const url = `${REACT_APP_API_ROOT}/files/url?url=${link}`;
    return upload(url, {});
};

export const getFileContent = id => {
    return get(`${REACT_APP_API_ROOT}/files/${id}`);
};

export const isValidUrl = url => {
    let newUrl;
    try {
        newUrl = new URL(url);
    } catch (e) {
        return false;
    }
    return (
        (newUrl.protocol === 'http:' || newUrl.protocol === 'https:') &&
        newUrl.pathname?.length > 5 &&
        newUrl.pathname.slice(-4) === '.pdf'
    );
};

const buildFileData = async file => {
    const fileData = new FormData();
    fileData.append('file', file);

    const contentMD5 = await calculateContentMD5(file);
    fileData.append('contentMD5', contentMD5);

    return fileData;
};

const calculateContentMD5 = file =>
    new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => {
            // TODO: https://github.com/veraPDF/verapdf-webapp-gui/issues/31
            const wordArray = WordArray.create(reader.result);
            const contentMD5 = md5(wordArray).toString();
            resolve(contentMD5);
        };
        reader.readAsArrayBuffer(file);
    });
