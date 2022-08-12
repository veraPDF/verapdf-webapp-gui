import React from 'react';
import ResetButton from '../../../shared/resetButton/ResetButton';

import './NotFound.scss';

function NotFound() {
    return (
        <section className="not-found">
            <div className="not-found__message">
                <h2>Validation job not found</h2>
            </div>
            <ResetButton color="primary" variant="contained">
                Go to upload page
            </ResetButton>
        </section>
    );
}

export default NotFound;
