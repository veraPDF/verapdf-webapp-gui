import * as db from '../storages/IndexedDB';

const DB_NAME = 'pdfStorage';
const STORE_NAME = 'files';
const KEY = 'name';

const MAX_FILES = 10;

let pdfStorage;

const getStorage = async () => {
    if (!pdfStorage) {
        pdfStorage = await db.connect(DB_NAME, STORE_NAME, KEY);
    }
    return pdfStorage;
};

const getAllFiles = async () => {
    return (await getStorage()).getAll();
};

const getFile = async fileName => {
    return (await getStorage()).getOne(fileName);
};

const setFile = async file => {
    let storage = await getStorage();
    let files = await storage.getAll();
    if (files.length >= MAX_FILES) {
        // TODO: replace this dumb implementation with something smarter in the future
        //  since files are ordered alphabetically and A.pdf will be always removed before B.pdf even if it was added later
        await storage.deleteOne(files[0].name);
    }
    return storage.setOne(file);
};

export { getAllFiles, setFile, getFile };
