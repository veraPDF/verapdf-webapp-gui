import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Upload from './layouts/pages/upload/Upload';

const PAGES = {
    UPLOAD: '/new-job/files',
};

function AppRouter() {
    function getPage(path, routeProps = {}) {
        switch (path) {
            case PAGES.UPLOAD:
                return () => {
                    return <Upload {...routeProps} />;
                };
            default:
                return () => {
                    return <Upload {...routeProps} />;
                };
        }
    }

    return (
        <Switch>
            <Route exact path={PAGES.UPLOAD} render={getPage(PAGES.UPLOAD)} />
        </Switch>
    );
}

export default React.memo(AppRouter);
