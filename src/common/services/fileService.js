import SparkMD5 from 'spark-md5';
import { get, upload } from './api';
import { JOB_OLD_FILE } from '../store/constants';

const { REACT_APP_API_ROOT, PUBLIC_URL } = process.env;

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
        const CHUNK_SIZE = 2 * 1024 * 1024;
        const CHUNKS = Math.ceil(file.size / CHUNK_SIZE);
        const blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;
        const spark = new SparkMD5.ArrayBuffer();
        const reader = new FileReader();
        let currentChunk = 0;

        const loadNext = () => {
            const start = currentChunk * CHUNK_SIZE;
            const end = start + CHUNK_SIZE >= file.size ? file.size : start + CHUNK_SIZE;
            reader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };

        reader.onload = event => {
            spark.append(event.target.result);
            currentChunk++;
            currentChunk < CHUNKS ? loadNext() : resolve(spark.end());
        };

        loadNext();
    });

export const redirectToStartScreen = () => {
    const oldFileName = sessionStorage.getItem(JOB_OLD_FILE);
    let location = window.location.pathname;
    if (!PUBLIC_URL.endsWith('/')) {
        location = location.replace(/\/$/, '');
    }
    if (oldFileName && location !== PUBLIC_URL && location !== `${PUBLIC_URL}/new-job/files`) {
        // Redirect to start screen and hide Loading view
        window.location.replace(PUBLIC_URL);
        return true;
    }
    return false;
};
