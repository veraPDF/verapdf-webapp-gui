import React from 'react';
import PageNavigation from '../../../shared/pageNavigation/PageNavigation';
import AppPages from '../../../AppPages';
import './NotFound.scss';

const backButton = {
    label: 'Go to upload page',
    to: AppPages.UPLOAD,
};
function NotFound() {
    return (
        <section className="not-found">
            <div className="not-found__message">
                <h1>Validation job not found</h1>
            </div>
            <PageNavigation center={backButton} />
        </section>
    );
}

export default NotFound;
