import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Upload from './layouts/pages/upload/Upload';
import About from './layouts/pages/about/About';

const PAGES = {
    UPLOAD: '/new-job/files',
    ABOUT: '/about',
};

function AppRouter() {
    return (
        <Switch>
            <Route exact path={PAGES.UPLOAD}>
                <Upload />
            </Route>
            <Route exact path={PAGES.ABOUT}>
                <About />
            </Route>
            <Redirect to={PAGES.UPLOAD} />
        </Switch>
    );
}

export default AppRouter;
