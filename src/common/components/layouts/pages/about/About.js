import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

import './About.scss';

function About() {
    const [content, setContent] = useState('');
    useEffect(() => {
        const fetchFile = async () => {
            const file = await fetch(process.env.PUBLIC_URL + '/ABOUT.md');
            const content = await file.text();
            setContent(marked(content));
        };
        fetchFile().catch(console.error);
    }, []);
    return (
        <section className="about">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </section>
    );
}

export default About;
