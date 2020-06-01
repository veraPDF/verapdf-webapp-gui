import { integrationTest, toggleSettingsCheckbox } from './index';
import Loading from '../../components/layouts/pages/loading/Loading';

const { REACT_APP_VERSION } = process.env;

describe('App', () => {
    it(
        'verify app version in footer',
        integrationTest((store, component) => {
            const version = component.find('.app-footer > div').text();
            expect(version).toEqual(`version: ${REACT_APP_VERSION}`);
        })
    );

    it.skip(
        'loading page appeared',
        integrationTest(
            (store, component) => {
                expect(component.find(Loading)).toHaveLength(1);
                expect(component.find('.loading').text()).toBe('Initialization');
            },
            {
                skipLoading: false,
            }
        )
    );

    it(
        'Turn settings on and off',
        integrationTest((store, component) => {
            expect(component.find('.MuiStepLabel-root')).toHaveLength(3);

            toggleSettingsCheckbox(component, true);
            expect(component.find('.MuiStepLabel-root')).toHaveLength(4);

            toggleSettingsCheckbox(component, false);
            expect(component.find('.MuiStepLabel-root')).toHaveLength(3);
        })
    );
});
