import { integrationTest, isFileUploaded, isJobUpdated, checkJobStatus, moveNext, storeFile, waitFor } from './index';
import { createJob, executeJob, getJob, updateJob } from '../../services/jobService';
import { uploadFile } from '../../services/fileService';
import Progress from '../../components/shared/progress/Progress';
import Results from '../../components/layouts/pages/results/Results';

const verifyProgressTitle = (component, expectedLines) => {
    component.update();
    expect(
        component
            .find(Progress)
            .prop('title')
            .split('\n')
    ).toEqual(expectedLines);
};

describe('Validation', () => {
    it(
        'Validation process completed',
        integrationTest(async (store, component) => {
            await storeFile(component, store);

            // Move to settings
            moveNext(component);

            // Click validate button
            moveNext(component);
            expect(createJob).toHaveBeenCalledTimes(1);
            await waitFor(store, checkJobStatus('CREATED'));
            component.update();

            // Once job is created app should be redirected to Status page
            expect(component.find(Progress)).toHaveLength(1);
            verifyProgressTitle(component, ['● Initializing new validation job...']);

            await waitFor(store, isFileUploaded);
            expect(uploadFile).toHaveBeenCalledTimes(1);
            verifyProgressTitle(component, ['✓ Validation job initiated.', '● Uploading PDF...']);

            await waitFor(store, isJobUpdated);
            expect(updateJob).toHaveBeenCalledTimes(1);
            verifyProgressTitle(component, [
                '✓ Validation job initiated.',
                '✓ PDF uploaded.',
                '● Validation job updating...',
            ]);

            await waitFor(store, checkJobStatus('PROCESSING'));
            expect(executeJob).toHaveBeenCalledTimes(1);
            verifyProgressTitle(component, [
                '✓ Validation job initiated.',
                '✓ PDF uploaded.',
                '✓ Validation job updated.',
                '● Starting job execution...',
            ]);

            await waitFor(store, checkJobStatus('FINISHED'));
            expect(getJob).toHaveBeenCalled();
            component.update();

            // Once job is complete app should be redirected to Results summary page
            expect(component.find(Results)).toHaveLength(1);
        })
    );
});
