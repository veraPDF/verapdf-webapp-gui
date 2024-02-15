const checkIsVisible = (elem, fixedElem) => {
    const elemBottom = elem.offsetTop + elem.clientHeight;
    const containerTop = window.scrollY;

    return containerTop < elemBottom - fixedElem.clientHeight;
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
