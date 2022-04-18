window.onload = () => {
  fetch('./assets/version.txt').then(res => {
    if (!res.ok) {
      throw new Error("Failed to load version file");
    }
    return res.text();
  }).then(version => {
    document.getElementById('app-version').textContent = version;
    document.getElementById('app-version-label').hidden = false;
  }).catch((e) => console.error(e.message));
}