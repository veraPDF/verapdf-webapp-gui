import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import fs from 'mz/fs';

import App from '../../common/components/App';
import configureStore from '../../common/store/rootStore';
import { getInfo as getFileServiceInfo, uploadFile, getFileContent } from '../../common/services/fileService';
import {
    getInfo as getJobServiceInfo,
    createJob,
    updateJob,
    executeJob,
    getJob,
} from '../../common/services/jobService';
import { getInfo as getWorkerServiceInfo, getAppsBuildInfo } from '../../common/services/workerService';
import { getList as getProfilesList } from '../../common/services/profiles';
import { getAllFiles, setFile, getFile } from '../../common/services/pdfStorage';
import { getProgress } from '../../common/store/job/progress/selectors';

jest.mock('../../common/services/fileService');
jest.mock('../../common/services/jobService');
jest.mock('../../common/services/workerService');
jest.mock('../../common/services/profiles');

jest.mock('../../common/services/pdfStorage');
getAllFiles.mockImplementation(() => Promise.resolve([]));
getFile.mockImplementation(() => Promise.resolve(-1));
setFile.mockImplementation(({ name }) => Promise.resolve(!!name));

const fetchSpy = jest.spyOn(global, 'fetch');

const DEFAULT_SERVICE_INFO = {
    group: 'org.verapdf',
    artifact: 'local-storage-service-server',
    name: 'local-storage-service-server',
    version: '0.1.0-SNAPSHOT',
    time: '2020-03-17T07:30:59.207Z',
};

const DEFAULT_APPS_VERSION = '1.1.1';

export const TEST_FILE = {
    path: './src/__tests__/integration/assets/test.pdf',
    name: 'test.pdf',
    type: 'application/pdf',
    size: '30.56 KB',
};

const JOB = {
    id: 'job-id',
    profile: 'TEST_PROFILE_1',
    status: 'CREATED',
    tasks: [],
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
    workerServiceStatus: {
        ok: true,
        responseJson: {
            build: {
                ...DEFAULT_SERVICE_INFO,
                artifact: 'worker-service-server',
                name: 'worker-service-server',
                apps: { version: DEFAULT_APPS_VERSION },
            },
        },
    },
    appsInfo: {
        ok: true,
        responseJson: {
            lastUpdated: '2022-05-24T08:55:17.005Z',
        },
    },
    profilesList: {
        ok: true,
        responseJson: [
            { profileName: 'TEST_PROFILE_1', humanReadableName: 'Test profile 1', enabled: true },
            { profileName: 'TEST_PROFILE_2', humanReadableName: 'Test profile 2', enabled: true },
            { profileName: 'TEST_PROFILE_3', humanReadableName: 'Test profile 3', enabled: false },
        ],
    },
    uploadFile: {
        ok: true,
        responseJson: {
            contentMD5: 'file-md5',
            contentSize: 100,
            contentType: TEST_FILE.type,
            fileName: TEST_FILE.name,
            id: 'file-id',
        },
    },
    job: {
        ok: true,
        responseJson: { ...JOB },
    },
    updatedJob: {
        ok: true,
        responseJson: {
            ...JOB,
            tasks: [{ id: 'file-id' }],
        },
    },
    startedJob: {
        ok: true,
        responseJson: {
            ...JOB,
            status: 'PROCESSING',
            tasks: [
                {
                    id: 'file-id',
                    status: 'QUEUED',
                    validationResultId: 'result-file-id',
                },
            ],
        },
    },
    finishedJob: {
        ok: true,
        responseJson: {
            ...JOB,
            status: 'FINISHED',
            tasks: [
                {
                    id: 'file-id',
                    status: 'FINISHED',
                    validationResultId: 'result-file-id',
                },
            ],
        },
    },
    resultFile: {
        ok: true,
        responseJson: {
            compliant: true,
            details: {
                passedRules: 1,
                failedRules: 1,
                passedChecks: 1,
                failedChecks: 1,
                ruleSummaries: [],
            },
        },
    },
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
    mockServiceJsonResponse(getWorkerServiceInfo, startupResponses.workerServiceStatus);
    mockServiceJsonResponse(getAppsBuildInfo, startupResponses.appsInfo);
    mockServiceJsonResponse(getProfilesList, startupResponses.profilesList);

    // TODO: all calls below ARE NOT startup, hence should be mocked in corresponding test file instead
    mockServiceJsonResponse(createJob, startupResponses.job);
    mockServiceJsonResponse(uploadFile, startupResponses.uploadFile);
    mockServiceJsonResponse(updateJob, startupResponses.updatedJob);
    mockServiceJsonResponse(executeJob, startupResponses.startedJob);
    mockServiceJsonResponse(getJob, startupResponses.finishedJob);
    mockServiceJsonResponse(getFileContent, startupResponses.resultFile);

    return configureStore();
};

export const integrationTest = (
    testFn,
    { startupResponses = DEFAULT_STARTUP_RESPONSES, initialEntries = ['/'], skipLoading = true } = {}
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

    if (skipLoading) {
        await skipLoadingPage(store, component);
    }

    // Execute the test
    try {
        await testFn(store, component);
    } finally {
        // Make sure no real requests were made during the test and reset all service mocks
        expect(fetchSpy).not.toBeCalled();
        fetchSpy.mockReset();
        getFileServiceInfo.mockReset();
        getJobServiceInfo.mockReset();
        getWorkerServiceInfo.mockReset();
        getAppsBuildInfo.mockReset();
        getProfilesList.mockReset();
        createJob.mockReset();
        uploadFile.mockReset();
        updateJob.mockReset();
        executeJob.mockReset();
        getJob.mockReset();
        getFileContent.mockReset();

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

export const storeFile = async (component, store, file = TEST_FILE) => {
    await act(async () => {
        await selectFile(component, file);
        await waitFor(store, isFileStored);
    });
    component.update();
};

export const navigateWithHeaderLink = (component, linkSelector) => {
    component.find(`.app-header a.app-link${linkSelector}`).simulate('click', { button: 0 });
    component.update();
};

export const getNextStepButton = component => component.find('.page-navigation__end button');
export const getPrevStepButton = component => component.find('.page-navigation__start button');

export const moveBack = component => {
    getPrevStepButton(component).simulate('click', { button: 0 });
    component.update();
};
export const moveNext = component => {
    getNextStepButton(component).simulate('click', { button: 0 });
    component.update();
};

export const isAppInitialized = state => state.appState.initialized;
export const skipLoadingPage = async (store, component) => {
    await waitFor(store, isAppInitialized);
    component.update();
};

export const isFileStored = state => state.pdfFiles.length;
export const stepFinished = key => state => getProgress(state).steps.find(({ stepKey }) => stepKey === key)?.completed;
