import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

import './PrivacyPolicy.scss';

function PrivacyPolicy() {
    const [content, setContent] = useState('');
    useEffect(() => {
        const fetchFile = async () => {
            const file = await fetch(process.env.PUBLIC_URL + '/PRIVACY_POLICY.md');
            const content = await file.text();
            setContent(marked(content));
        };
        fetchFile().catch(console.error);
    }, []);
    return (
        <section className="privacy-policy">
            <div dangerouslySetInnerHTML={{ __html: content }} />
        </section>
    );
}

export default PrivacyPolicy;
