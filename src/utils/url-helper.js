const combineUrl = (url1, url2) => {
    url1 = url1.replace(/\/+$/, '');
    url2 = url2.replace(/^\//, '');

    return url1 + '/' + url2;
}

export { combineUrl }