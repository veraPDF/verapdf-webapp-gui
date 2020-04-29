import { integrationTest, navigateWithHeaderLink, waitFor } from './index';
import { getInfo as getFileServiceInfo } from '../../services/fileService';
import { getInfo as getJobServiceInfo } from '../../services/jobService';

const ABOUT_LINK = '.about-link';
const SERVICE_NAMES = {
    fileService: '.file',
    jobService: '.job',
};
const SERVICE = {
    LOADING: 'loading service status...',
    FAILED: 'service is not available.',
    SUCCESS: '0.1.0-SNAPSHOT, built on March 17, 2020 at 7:30:59 AM UTC',
};

const fileServiceLoaded = state => state.serverInfo.fileService.available != null;
const jobServiceLoaded = state => state.serverInfo.jobService.available != null;
const allServicesLoaded = state => fileServiceLoaded(state) && jobServiceLoaded(state);

const getServiceInfo = (component, serviceName) =>
    component.find(`.service-info${serviceName} .service-info__status`).text();

describe('About', () => {
    it(
        'all services available',
        integrationTest(async (store, component) => {
            navigateWithHeaderLink(component, ABOUT_LINK);

            expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe(SERVICE.LOADING);
            expect(getServiceInfo(component, SERVICE_NAMES.jobService)).toBe(SERVICE.LOADING);

            expect(getFileServiceInfo).toHaveBeenCalledTimes(1);
            expect(getJobServiceInfo).toHaveBeenCalledTimes(1);
            await waitFor(store, allServicesLoaded);

            expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe(SERVICE.SUCCESS);
            expect(getServiceInfo(component, SERVICE_NAMES.jobService)).toBe(SERVICE.SUCCESS);
        })
    );

    it(
        'all services unavailable',
        integrationTest(
            async (store, component) => {
                navigateWithHeaderLink(component, ABOUT_LINK);

                expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe(SERVICE.LOADING);
                expect(getServiceInfo(component, SERVICE_NAMES.jobService)).toBe(SERVICE.LOADING);

                expect(getFileServiceInfo).toHaveBeenCalledTimes(1);
                expect(getJobServiceInfo).toHaveBeenCalledTimes(1);
                await waitFor(store, allServicesLoaded);

                expect(getServiceInfo(component, SERVICE_NAMES.fileService)).toBe(SERVICE.FAILED);
                expect(getServiceInfo(component, SERVICE_NAMES.jobService)).toBe(SERVICE.FAILED);
            },
            {
                startupResponses: {
                    fileServiceStatus: { ok: false },
                    jobServiceStatus: { ok: false },
                },
            }
        )
    );
});
