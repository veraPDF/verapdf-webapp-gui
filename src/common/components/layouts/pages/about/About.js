import React from 'react';
import ReactMd from 'react-md-file';

import './About.scss';

function About() {
    return (
        <section className="about">
            <ReactMd fileName={process.env.PUBLIC_URL + '/ABOUT.md'} />
        </section>
    );
}

export default About;
