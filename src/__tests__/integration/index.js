import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';
import fs from 'mz/fs';

import App from '../../components/App';
import configureStore from '../../store/rootStore';
import { getInfo as getFileServiceInfo } from '../../services/fileSvc';
import { getAllFiles, setFile } from '../../services/pdfStorage';

jest.mock('../../services/fileSvc');

jest.mock('../../services/pdfStorage');
getAllFiles.mockImplementation(() => Promise.resolve([]));
setFile.mockImplementation(({ name }) => Promise.resolve(!!name));

const fetchSpy = jest.spyOn(global, 'fetch');

const DEFAULT_STARTUP_RESPONSES = {
    fileServiceStatus: {
        ok: true,
        responseJson: {
            build: {
                group: 'org.verapdf',
                artifact: 'local-storage-service-server',
                name: 'local-storage-service-server',
                version: '0.1.0-SNAPSHOT',
                time: '2020-03-17T07:30:59.207Z',
            },
        },
    },
};

export const mockServiceJsonResponse = (serviceFnMock, { ok, responseJson }) => {
    serviceFnMock.mockReturnValue(
        Promise.resolve({
            ok,
            json: () => Promise.resolve(responseJson),
        })
    );
};

export const configureTestStore = startupResponses => {
    // Mock responses for startup requests
    mockServiceJsonResponse(getFileServiceInfo, startupResponses.fileServiceStatus);

    return configureStore();
};

export const integrationTest = (
    testFn,
    { startupResponses = DEFAULT_STARTUP_RESPONSES, initialEntries = ['/'] } = {}
) => async () => {
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

export const uploadFile = async (component, fileData) => {
    const DropzoneInput = component.find('.dropzone__container > input');
    const file = await createFile(fileData);
    DropzoneInput.simulate('change', { target: { files: [file] } });
};

export const navigateWithHeaderLink = (component, linkSelector) => {
    component.find(`.app-header a.app-link${linkSelector}`).simulate('click', { button: 0 });
    component.update();
};
