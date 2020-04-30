import { DEFAULT_STARTUP_RESPONSES, TEST_FILE, integrationTest, uploadFile, moveNext } from './index';
import MaterialSelect from '@material-ui/core/Select';
import Settings from '../../components/layouts/pages/settings/Settings';

const PROFILE_VALUES = DEFAULT_STARTUP_RESPONSES.profilesList.responseJson.map(({ profileName }) => profileName);

const getProfileValue = store => store.getState().jobSettings.profile;
const getProfileSelect = component => component.find('#jobProfile').find(MaterialSelect);
const getProfileSelectError = component => component.find('.fatal-error span');

const selectProfile = (component, value) =>
    getProfileSelect(component)
        .props()
        .onChange({ target: { value } }, null);

describe('Settings', () => {
    describe('No saved settings', () => {
        it(
            'Profiles list not yet loaded',
            integrationTest(
                async (store, component) => {
                    await uploadFile(component, store);
                    moveNext(component);

                    expect(component.find(Settings)).toHaveLength(1);
                    expect(component.find('div#jobProfile').text()).toBe('Loading profiles...');
                },
                {
                    startupResponses: {
                        profilesList: {
                            responsePromise: new Promise(() => {}),
                        },
                    },
                }
            )
        );

        it(
            'Profiles list loaded',
            integrationTest(async (store, component) => {
                await uploadFile(component, store);
                moveNext(component);

                expect(component.find(Settings)).toHaveLength(1);
                component.update();

                // First profile should be selected by default
                expect(getProfileSelect(component).props().value).toBe(PROFILE_VALUES[0]);

                // TODO: Verify profile select options.
                //  At the moment options are rendered into portal, we need investigate how to test that
            })
        );

        it(
            'Profiles list failed to load',
            integrationTest(
                async (store, component) => {
                    await uploadFile(component, store);
                    moveNext(component);
                    expect(component.find(Settings)).toHaveLength(1);
                    expect(getProfileSelectError(component).text()).toBe(
                        'Failed to load validations profiles. You can try to refresh the page or return later.'
                    );
                },
                {
                    startupResponses: {
                        profilesList: { ok: false },
                    },
                }
            )
        );
    });

    it(
        'Profile changed',
        integrationTest(async (store, component) => {
            await uploadFile(component, store, TEST_FILE);
            moveNext(component);

            expect(getProfileValue(store)).toEqual(PROFILE_VALUES[0]);

            selectProfile(component, PROFILE_VALUES[1]);
            expect(getProfileValue(store)).toEqual(PROFILE_VALUES[1]);
        })
    );
});
