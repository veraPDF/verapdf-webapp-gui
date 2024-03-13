import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import Upload from './layouts/pages/upload/Upload';
import MarkdownPage from './layouts/pages/markdownPage/MarkdownPage';
import Settings from './layouts/pages/settings/Settings';
import JobStatus from './layouts/pages/status/JobStatus';
import Results from './layouts/pages/results/Results';
import NotFound from './layouts/pages/notFound/NotFound';
import Inspect from './layouts/pages/inspect/Inspect';
import AppPages from './AppPages';

function AppRouter() {
    return (
        <Switch>
            <Route exact path={AppPages.UPLOAD} component={Upload} />
            <Route exact path={AppPages.SETTINGS} component={Settings} />
            <Route path={AppPages.STATUS.route} component={JobStatus} />
            <Route path={AppPages.RESULTS.route} component={Results} />
            {Object.keys(AppPages.MARKED).map(page => (
                <Route key={page} exact path={AppPages.MARKED[page]}>
                    <MarkdownPage fileName={page} />
                </Route>
            ))}
            <Route exact path={AppPages.NOT_FOUND} component={NotFound} />
            <Route exact path={AppPages.INSPECT.route} component={Inspect} />
            <Redirect to={AppPages.UPLOAD} />
        </Switch>
    );
}

export default AppRouter;
