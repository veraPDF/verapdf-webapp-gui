import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { MemoryRouter as Router } from 'react-router-dom';

import App from '../../components/App';
import configureStore from '../../store/rootStore';
import { getInfo as getFileServiceInfo } from '../../services/fileSvc';

jest.mock('../../services/fileSvc');

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

export const navigateWithHeaderLink = (component, linkSelector) => {
    component.find(`.app-header a.app-link${linkSelector}`).simulate('click', { button: 0 });
    component.update();
};
