const checkIsVisible = (elem, fixedElem) => {
    const elemCenter = elem.offsetTop + elem.clientHeight / 2;
    const containerTop = window.scrollY;

    return containerTop < elemCenter - fixedElem.clientHeight;
};

window.onload = () => {
    fetch('./assets/version.txt')
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to load version file');
            }
            return res.text();
        })
        .then(version => {
            document.getElementById('app-version').textContent = version;
            document.getElementById('app-version-label').hidden = false;
        })
        .catch(e => console.error(e.message));

    const header = document.getElementById('header');
    const headerBtn = document.getElementById('btn-header');
    const tryBtn = document.getElementById('try-now-button');

    const handleScroll = () => {
        const isVisible = checkIsVisible(tryBtn, header);
        headerBtn.hidden = isVisible;
    };

    window.addEventListener('scroll', handleScroll);
};
