const METHOD = {
    READ_ONLY: 'readonly',
    READ_WRITE: 'readwrite',
};

const logError = err => {
    console.log(err);
};

const connectDB = (dbName, storeName, keyPath) => {
    return new Promise(resolve => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = logError;
        request.onsuccess = () => {
            resolve(request.result);
        };
        request.onupgradeneeded = () => {
            const db = request.result;
            // if there's no store
            if (!db.objectStoreNames.contains(storeName)) {
                // create it
                db.createObjectStore(storeName, { keyPath });
            }

            connectDB(dbName, storeName, keyPath);
        };
    });
};

const getOne = (db, storeName, keyValue) => {
    return new Promise(async resolve => {
        const request = db
            .transaction(storeName, METHOD.READ_ONLY)
            .objectStore(storeName)
            .get(keyValue);
        request.onerror = logError;
        request.onsuccess = () => {
            resolve(request.result ? request.result : -1);
        };
    });
};

const getAll = (db, storeName) => {
    return new Promise(async resolve => {
        const store = db.transaction(storeName, METHOD.READ_ONLY).objectStore(storeName);
        let rows = [];

        store.openCursor().onsuccess = e => {
            let cursor = e.target.result;
            if (cursor) {
                rows.push(cursor.value);
                cursor.continue();
            } else {
                resolve(rows);
            }
        };
    });
};

const setOne = async (db, storeName, storeObject) => {
    return new Promise(async resolve => {
        try {
            let result = false;
            const transaction = db.transaction(storeName, METHOD.READ_WRITE);
            const request = transaction.objectStore(storeName).put(storeObject);
            request.onsuccess = () => (result = true);
            request.onerror = e => {
                logError(e);
                result = false;
            };
            transaction.oncomplete = () => resolve(result);
            ['error', 'abort'].forEach(e => transaction.addEventListener(e, () => resolve(false)));
        } catch (e) {
            logError(e);
            resolve(false);
        }
    });
};

const deleteOne = async (db, storeName, keyValue) => {
    return new Promise(async resolve => {
        const request = db
            .transaction(storeName, METHOD.READ_WRITE)
            .objectStore(storeName)
            .delete(keyValue);
        request.onerror = e => {
            logError(e);
            resolve(false);
        };
        request.onsuccess = () => {
            console.log('File delete from DB:', keyValue);
            resolve(true);
        };
    });
};

const clearStorage = async (db, storeName) => {
    let tx = db.transaction(storeName, METHOD.READ_WRITE);
    await tx.objectStore(storeName).clear();
};

const connect = async (dbName, storeName, keyPath) => {
    let db = await connectDB(dbName, storeName, keyPath);

    return {
        getAll: getAll.bind(null, db, storeName),
        getOne: getOne.bind(null, db, storeName),
        setOne: setOne.bind(null, db, storeName),
        deleteOne: deleteOne.bind(null, db, storeName),
        clearStorage: clearStorage.bind(null, db, storeName),
    };
};

export { connect };
