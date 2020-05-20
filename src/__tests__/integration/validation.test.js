import { integrationTest, moveNext, storeFile, waitFor, stepFinished } from './index';
import { createJob, executeJob, getJob, updateJob } from '../../services/jobService';
import { getFileContent, uploadFile } from '../../services/fileService';
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
            await waitFor(store, stepFinished('JOB_CREATE'));
            component.update();

            // Once job is created app should be redirected to Status page
            expect(component.find(Progress)).toHaveLength(1);
            verifyProgressTitle(component, ['✓ Validation job initiated.']);

            await waitFor(store, stepFinished('FILE_UPLOAD'));
            expect(uploadFile).toHaveBeenCalledTimes(1);
            verifyProgressTitle(component, ['✓ Validation job initiated.', '✓ PDF uploaded.']);

            await waitFor(store, stepFinished('JOB_UPDATE'));
            expect(updateJob).toHaveBeenCalledTimes(1);
            verifyProgressTitle(component, [
                '✓ Validation job initiated.',
                '✓ PDF uploaded.',
                '✓ Validation job updated.',
            ]);

            await waitFor(store, stepFinished('JOB_EXECUTE'));
            expect(executeJob).toHaveBeenCalledTimes(1);
            verifyProgressTitle(component, [
                '✓ Validation job initiated.',
                '✓ PDF uploaded.',
                '✓ Validation job updated.',
                '✓ Job execution started.',
            ]);

            await waitFor(store, stepFinished('JOB_COMPLETE'));
            expect(getJob).toHaveBeenCalled();
            verifyProgressTitle(component, [
                '✓ Validation job initiated.',
                '✓ PDF uploaded.',
                '✓ Validation job updated.',
                '✓ Job execution started.',
                '✓ Validation complete.',
            ]);

            await waitFor(store, stepFinished('VALIDATION_RESULT_DOWNLOAD'));
            expect(getFileContent).toHaveBeenCalledTimes(1);
            component.update();

            // Once job is complete app should be redirected to Results summary page
            expect(component.find(Results)).toHaveLength(1);
        })
    );
});
