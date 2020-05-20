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

export const getFileContent = async id => {
    const FILE_CONTENT = {
        compliant: true,
        details: {
            passedRules: 1282,
            failedRules: 127,
            passedChecks: 3760,
            failedChecks: 1052,
            ruleSummaries: [],
        },
        profileName: 'Tagged pdf profile for PDF 1.7 specification',
        statement: 'PDF file is compliant with Validation Profile requirements.',
    };
    console.log('get file content:', id);
    return new Promise(resolve => setTimeout(() => resolve({ ...FILE_CONTENT }), 2000));
    // const url = `${REACT_APP_API_ROOT}/files/${id}`;
    // return get(url);
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
