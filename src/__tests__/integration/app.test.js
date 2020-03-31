import { integrationTest } from './index';

const { REACT_APP_VERSION } = process.env;

describe('App', () => {
    it(
        'verify app version in footer',
        integrationTest((store, component) => {
            const version = component.find('.app-footer > div').text();
            expect(version).toEqual(`version: ${REACT_APP_VERSION}`);
        })
    );
});
