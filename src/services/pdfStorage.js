import * as db from '../storages/IndexedDB';

const DB_NAME = 'pdfStorage';
const STORE_NAME = 'files';
const KEY = 'name';

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

const setFile = async file => {
    let storage = await getStorage();
    await storage.clearStorage();
    return storage.setOne(file);
};

export { getAllFiles, setFile };
