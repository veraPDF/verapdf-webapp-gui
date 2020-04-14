import React from 'react';
import AppPages from '../../../AppPages';
import Stepper from '../../../shared/stepper/Stepper';
import ProfileSelect from './profile/ProfileSelect';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';

import './Settings.scss';

function Settings() {
    const backButton = {
        label: 'Upload files',
        link: AppPages.UPLOAD,
    };

    return (
        <section className="settings">
            <Stepper activeStep={AppPages.SETTINGS} />
            <section className="job-settings">
                <form>
                    <ProfileSelect />
                </form>
            </section>
            <PageNavigation back={backButton} />
        </section>
    );
}

export default Settings;
