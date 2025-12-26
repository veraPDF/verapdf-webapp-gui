import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

import './MarkdownPage.scss';

function MarkdownPage({ fileName }) {
    const [content, setContent] = useState('');
    useEffect(() => {
        const fetchFile = async () => {
            const file = await fetch(process.env.PUBLIC_URL + `/${fileName}.md`);
            const content = await file.text();
            setContent(marked(content));
        };
        fetchFile().catch(console.error);
    }, [fileName]);
    return (
        <section className="markdown">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </section>
    );
}

export default MarkdownPage;
