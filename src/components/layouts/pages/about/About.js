import React from 'react';
import ReactMd from 'react-md-file';

function About() {
    return (
        <section className="about">
            <ReactMd fileName={process.env.PUBLIC_URL + '/ABOUT.md'} />
        </section>
    );
}

export default About;
