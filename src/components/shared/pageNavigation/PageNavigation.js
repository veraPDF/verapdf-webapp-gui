import React from 'react';

import './PageNavigation.scss';

function PageNavigation({ children }) {
    return <nav className="page-navigation">{children}</nav>;
}

export default PageNavigation;
