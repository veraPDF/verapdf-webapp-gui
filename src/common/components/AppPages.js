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
    MARKED: {
        // [fileName]: pathName
        ABOUT: '/about',
        PRIVACY_POLICY: '/privacy-policy',
        'wiki_WCAG2.2_human': '/wcag-2-2-human',
        'wiki_WCAG2.2_machine': '/wcag-2-2-machine',
    },
    LOADING: '/loading',
    NOT_FOUND: '/404',
};
