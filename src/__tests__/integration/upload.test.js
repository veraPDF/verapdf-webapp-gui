import {
    TEST_FILE,
    integrationTest,
    getNextStepButton,
    storeFile,
    moveBack,
    moveNext,
    toggleSettingsCheckbox,
} from './index';

const EMPTY_DROPZONE_TEXT = 'Drop a PDF file, or click to select a file';
const FAILED_FILE = {
    ...TEST_FILE,
    name: '',
};

const isStoredInDB = store => store.getState().pdfFiles[0].hasBackup;
const simulateUnload = () => {
    let e = new Event('beforeunload');
    global.dispatchEvent(e);
    return e.defaultPrevented;
};

const getDropzoneText = component => component.find('.dropzone-text').text();

describe('Upload', () => {
    it(
        'dropzone is loaded',
        integrationTest((store, component) => {
            expect(getDropzoneText(component)).toEqual(EMPTY_DROPZONE_TEXT);
            expect(getNextStepButton(component).props().disabled).toBe(true);
        })
    );

    it(
        'file is dropped',
        integrationTest(async (store, component) => {
            await storeFile(component, store);

            expect(getDropzoneText(component)).toEqual(`${TEST_FILE.name} - ${TEST_FILE.size}`);
            expect(getNextStepButton(component).props().disabled).toBeFalsy();
        })
    );

    it(
        'IndexedDB storing success',
        integrationTest(async (store, component) => {
            await storeFile(component, store);

            expect(isStoredInDB(store)).toBe(true);
            expect(simulateUnload()).toEqual(false);
        })
    );

    it(
        'IndexedDB storing failed',
        integrationTest(async (store, component) => {
            await storeFile(component, store, FAILED_FILE);

            expect(isStoredInDB(store)).toBe(false);
            expect(simulateUnload()).toEqual(true);
        })
    );

    it(
        'File still attached after going back from next step',
        integrationTest(async (store, component) => {
            await storeFile(component, store);
            toggleSettingsCheckbox(component, true);

            moveNext(component);
            moveBack(component);

            expect(getDropzoneText(component)).toEqual(`${TEST_FILE.name} - ${TEST_FILE.size}`);
        })
    );
});
