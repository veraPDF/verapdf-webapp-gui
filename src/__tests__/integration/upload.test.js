import { integrationTest, waitFor, uploadFile } from './index';
import { act } from 'react-dom/test-utils';

const EMPTY_DROPZONE_TEXT = 'Drop some PDF files here, or click to select files';
const TEST_FILE = {
    path: './src/__tests__/integration/assets/test.pdf',
    name: 'test.pdf',
    type: 'application/pdf',
    size: '30.56 KB',
};
const FAILED_FILE = {
    ...TEST_FILE,
    name: '',
};

const isFileUploaded = state => state.pdfFiles.length;
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
        })
    );

    it(
        'file is dropped',
        integrationTest(async (store, component) => {
            // Wrapped in act() cause of warning: 'When testing, code that causes React state updates should be wrapped into act(...'
            await act(async () => {
                await uploadFile(component, TEST_FILE);
                await waitFor(store, isFileUploaded);
            });

            expect(getDropzoneText(component)).toEqual(`${TEST_FILE.name} - ${TEST_FILE.size}`);
        })
    );

    it(
        'IndexedDB storing success',
        integrationTest(async (store, component) => {
            // Wrapped in act() cause of warning: 'When testing, code that causes React state updates should be wrapped into act(...'
            await act(async () => {
                await uploadFile(component, TEST_FILE);
                await waitFor(store, isFileUploaded);
            });

            expect(isStoredInDB(store)).toBe(true);

            expect(simulateUnload()).toEqual(false);
        })
    );

    it(
        'IndexedDB storing failed',
        integrationTest(async (store, component) => {
            // Wrapped in act() cause of warning: 'When testing, code that causes React state updates should be wrapped into act(...'
            await act(async () => {
                await uploadFile(component, FAILED_FILE);
                await waitFor(store, isFileUploaded);
            });

            expect(isStoredInDB(store)).toBe(false);

            expect(simulateUnload()).toEqual(true);
        })
    );
});
