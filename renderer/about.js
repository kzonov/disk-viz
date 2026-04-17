const v = new URLSearchParams(location.search).get('v');
document.getElementById('version').textContent = v ? 'Version ' + v : '';
