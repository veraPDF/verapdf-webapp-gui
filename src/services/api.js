export class ApiError extends Error {
    constructor(code, ...params) {
        super(...params);
        this.name = 'ApiError';
        this.code = code;
    }
}

export const get = url => fetch(url).then(handleResponse);

export const post = (url, data = {}) => {
    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const put = (url, data = {}) => {
    return fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(handleResponse);
};

export const upload = (url, data) => {
    return fetch(url, {
        method: 'POST',
        body: data,
    }).then(handleResponse);
};

export const handleResponse = async response => {
    const contentType = response.headers.get('Content-Type');

    let body;
    switch (contentType) {
        case 'application/json':
        case 'application/vnd.spring-boot.actuator.v3+json':
        case 'application/octet-stream':
            body = await response.json();
            break;
        case 'text/html':
            body = await response.text();
            break;
        default:
            body = await response.body;
    }

    if (response.ok) {
        return body;
    } else {
        const message = contentType === 'application/json' ? body.message : body;
        throw new ApiError(response.status, message);
    }
};
