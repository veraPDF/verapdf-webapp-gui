import { integrationTest, navigateWithHeaderLink, waitFor } from './index';
import { getInfo as getFileServiceInfo } from '../../services/fileSvc';

const ABOUT_LINK = '.about-link';
const SERVICE_NAMES = {
    fileService: '.file',
};

const statusLoaded = state => state.serverInfo.fileService.available != null;

const getServiceInfo = (component, serviceName) =>
    component.find(`.service-info${serviceName} .service-info__status`).text();

describe('About', () => {
    it(
        'all services available',
        integrationTest(async (store, component) => {
            navigateWithHeaderLink(component, ABOUT_LINK);

            expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe('loading service status...');

            expect(getFileServiceInfo).toHaveBeenCalledTimes(1);
            await waitFor(store, statusLoaded);

            expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe(
                '0.1.0-SNAPSHOT, built on March 17, 2020 at 7:30:59 AM UTC'
            );
        })
    );

    it(
        'all services unavailable',
        integrationTest(
            async (store, component) => {
                navigateWithHeaderLink(component, ABOUT_LINK);

                expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe('loading service status...');

                expect(getFileServiceInfo).toHaveBeenCalledTimes(1);
                await waitFor(store, statusLoaded);

                expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe('service is not available.');
            },
            {
                startupResponses: {
                    fileServiceStatus: { ok: false },
                },
            }
        )
    );
});
