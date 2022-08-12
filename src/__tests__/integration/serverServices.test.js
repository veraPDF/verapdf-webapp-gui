import { integrationTest, waitFor } from './index';
import { getInfo as getFileServiceInfo } from '../../common/services/fileService';
import { getInfo as getJobServiceInfo } from '../../common/services/jobService';

const SERVICE_NAMES = {
    fileService: 'File storage',
    jobService: 'Job service',
};
const SERVICE = {
    LOADING: 'loading service status...',
    FAILED: 'service is not available.',
    SUCCESS: '0.1.0-SNAPSHOT, built on March 17, 2020 at 7:30:59 AM UTC',
};

const fileServiceLoaded = state => state.serverInfo.fileService.available != null;
const jobServiceLoaded = state => state.serverInfo.jobService.available != null;
const allServicesLoaded = state => fileServiceLoaded(state) && jobServiceLoaded(state);

const getServices = component => {
    const versionTitle = component.find('.app-footer > div').props().title;
    const servicesMap = {};
    versionTitle.split('\n').forEach(service => {
        const [name, status] = service.split(': ');
        servicesMap[name] = status;
    });
    return { ...servicesMap };
};

describe('Check services status', () => {
    it(
        'File storage: loading service status...',
        integrationTest(async (store, component) => {
            let services = getServices(component);

            expect(services[SERVICE_NAMES.fileService]).toBe(SERVICE.LOADING);
            expect(services[SERVICE_NAMES.jobService]).toBe(SERVICE.LOADING);

            expect(getFileServiceInfo).toHaveBeenCalledTimes(1);
            expect(getJobServiceInfo).toHaveBeenCalledTimes(1);
            await waitFor(store, allServicesLoaded);
            component.update();
            services = getServices(component);

            expect(services[SERVICE_NAMES.fileService]).toBe(SERVICE.SUCCESS);
            expect(services[SERVICE_NAMES.jobService]).toBe(SERVICE.SUCCESS);
        })
    );

    it(
        'all services unavailable',
        integrationTest(
            async (store, component) => {
                let services = getServices(component);

                expect(services[SERVICE_NAMES.fileService]).toBe(SERVICE.LOADING);
                expect(services[SERVICE_NAMES.jobService]).toBe(SERVICE.LOADING);

                expect(getFileServiceInfo).toHaveBeenCalledTimes(1);
                expect(getJobServiceInfo).toHaveBeenCalledTimes(1);
                await waitFor(store, allServicesLoaded);
                component.update();
                services = getServices(component);

                expect(services[SERVICE_NAMES.fileService]).toBe(SERVICE.FAILED);
                expect(services[SERVICE_NAMES.jobService]).toBe(SERVICE.FAILED);
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
