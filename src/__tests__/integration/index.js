import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import fs from 'mz/fs';

import App from '../../components/App';
import configureStore from '../../store/rootStore';
import { getInfo as getFileServiceInfo } from '../../services/fileService';
import { getInfo as getJobServiceInfo } from '../../services/jobService';
import { getList as getProfilesList } from '../../services/profiles';
import { getAllFiles, setFile } from '../../services/pdfStorage';

jest.mock('../../services/fileService');
jest.mock('../../services/jobService');
jest.mock('../../services/profiles');

jest.mock('../../services/pdfStorage');
getAllFiles.mockImplementation(() => Promise.resolve([]));
setFile.mockImplementation(({ name }) => Promise.resolve(!!name));

const fetchSpy = jest.spyOn(global, 'fetch');

const DEFAULT_SERVICE_INFO = {
    group: 'org.verapdf',
    artifact: 'local-storage-service-server',
    name: 'local-storage-service-server',
    version: '0.1.0-SNAPSHOT',
    time: '2020-03-17T07:30:59.207Z',
};
export const DEFAULT_STARTUP_RESPONSES = {
    fileServiceStatus: {
        ok: true,
        responseJson: {
            build: { ...DEFAULT_SERVICE_INFO },
        },
    },
    jobServiceStatus: {
        ok: true,
        responseJson: {
            build: {
                ...DEFAULT_SERVICE_INFO,
                artifact: 'job-service-server',
                name: 'job-service-server',
            },
        },
    },
    profilesList: {
        ok: true,
        responseJson: [
            { profileName: 'TEST_PROFILE_1', humanReadableName: 'Test profile 1', available: true },
            { profileName: 'TEST_PROFILE_2', humanReadableName: 'Test profile 2', available: true },
            { profileName: 'TEST_PROFILE_3', humanReadableName: 'Test profile 3', available: false },
        ],
    },
};

export const TEST_FILE = {
    path: './src/__tests__/integration/assets/test.pdf',
    name: 'test.pdf',
    type: 'application/pdf',
    size: '30.56 KB',
};

export const mockServiceJsonResponse = (serviceFnMock, { ok, responseJson, responsePromise }) => {
    if (responsePromise) {
        return serviceFnMock.mockReturnValue(responsePromise);
    }
    if (ok) {
        serviceFnMock.mockReturnValue(Promise.resolve(responseJson));
    } else {
        serviceFnMock.mockReturnValue(Promise.reject(responseJson));
    }
};

export const configureTestStore = startupResponses => {
    // Mock responses for startup requests
    mockServiceJsonResponse(getFileServiceInfo, startupResponses.fileServiceStatus);
    mockServiceJsonResponse(getJobServiceInfo, startupResponses.jobServiceStatus);
    mockServiceJsonResponse(getProfilesList, startupResponses.profilesList);

    return configureStore();
};

export const integrationTest = (
    testFn,
    { startupResponses = DEFAULT_STARTUP_RESPONSES, initialEntries = ['/'] } = {}
) => async () => {
    startupResponses = { ...DEFAULT_STARTUP_RESPONSES, ...startupResponses };
    // Render app
    const store = configureTestStore(startupResponses);

    const component = mount(
        <Provider store={store} initialEntries={initialEntries}>
            <Router basename="/demo">
                <App />
            </Router>
        </Provider>
    );

    // Execute the test
    try {
        await testFn(store, component);
    } finally {
        // Make sure no real requests were made during the test and reset all service mocks
        expect(fetchSpy).not.toBeCalled();
        fetchSpy.mockReset();
        getFileServiceInfo.mockReset();
        getJobServiceInfo.mockReset();
        getProfilesList.mockReset();

        // Cleanup session storage
        sessionStorage.clear();
    }
};

export const waitFor = (store, predicate) =>
    new Promise(resolve => {
        const unsubscribe = store.subscribe(() => {
            if (predicate(store.getState())) {
                unsubscribe();
                resolve();
            }
        });
    });

export const createFile = fileData =>
    new Promise(async resolve => {
        const { path, name, type } = fileData;
        let file = await fs.readFile(path);
        file = new File([file], name, { type });
        resolve(file);
    });

export const selectFile = async (component, fileData) => {
    const DropzoneInput = component.find('.dropzone__container > input');
    const file = await createFile(fileData);
    DropzoneInput.simulate('change', { target: { files: [file] } });
};

export const uploadFile = async (component, store, file = TEST_FILE) => {
    await act(async () => {
        await selectFile(component, file);
        await waitFor(store, isFileUploaded);
    });
    component.update();
};

export const navigateWithHeaderLink = (component, linkSelector) => {
    component.find(`.app-header a.app-link${linkSelector}`).simulate('click', { button: 0 });
    component.update();
};

export const getNextStepButton = component => component.find('.nav-button_forward button');
export const getPrevStepButton = component => component.find('.nav-button_back button');

export const moveBack = component => {
    getPrevStepButton(component).simulate('click', { button: 0 });
    component.update();
};
export const moveNext = component => {
    getNextStepButton(component).simulate('click', { button: 0 });
    component.update();
};

export const isFileUploaded = state => state.pdfFiles.length;
