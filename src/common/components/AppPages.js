export default {
    UPLOAD: '/new-job/files',
    SETTINGS: '/new-job/settings',
    STATUS: {
        route: '/jobs/:id/status',
        url(id) {
            return `/jobs/${id}/status`;
        },
    },
    RESULTS: {
        route: '/jobs/:id/result-summary',
        url(id) {
            return `/jobs/${id}/result-summary`;
        },
    },
    INSPECT: {
        route: '/jobs/:id/result-details',
        url(id) {
            return `/jobs/${id}/result-details`;
        },
    },
    ABOUT: '/about',
    LOADING: '/loading',
    NOT_FOUND: '/404',
};
