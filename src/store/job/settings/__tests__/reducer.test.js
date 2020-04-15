import reducer, { getDefaultState } from '../reducer';
import { JOB_SETTINGS } from '../../../constants';
import { setProfiles } from '../../../validationProfiles/actions';

describe('getDefaultState', () => {
    it('No stored settings', () => {
        expect(getDefaultState()).toEqual({
            profile: undefined,
        });
    });

    it('Have saved settings', () => {
        sessionStorage.setItem(JOB_SETTINGS, '{ "profile": "TEST_PROFILE_1" }');

        expect(getDefaultState()).toEqual({
            profile: 'TEST_PROFILE_1',
        });

        // Cleanup not to affect other tests
        sessionStorage.removeItem(JOB_SETTINGS);
    });
});

describe('PROFILES_SET', () => {
    const action = setProfiles([
        { profileName: 'TEST_PROFILE_1', humanReadableName: 'Test profile 1', available: true },
        { profileName: 'TEST_PROFILE_2', humanReadableName: 'Test profile 2', available: true },
        { profileName: 'TEST_PROFILE_3', humanReadableName: 'Test profile 3', available: false },
    ]);

    it('Existing profile should be preserved', () => {
        const state = {
            profile: 'TEST_PROFILE_2',
        };
        expect(reducer(state, action)).toBe(state);
    });

    it('Non-existing profile should be reset', () => {
        const state = {
            profile: 'OBSOLETE',
        };
        expect(reducer(state, action)).toEqual({
            profile: 'TEST_PROFILE_1',
        });
    });
});
