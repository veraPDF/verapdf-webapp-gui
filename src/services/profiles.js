import { handleResponse } from './api';

const PROFILES = [
    { profileName: 'TAGGED_PDF', humanReadableName: 'Tagged PDF', available: true },
    { profileName: 'PDFUA_1_MACHINE', humanReadableName: 'PDF/UA-1 (Machine)', available: true },
    { profileName: 'PDFUA_1', humanReadableName: 'PDF/UA-1', available: false },
    { profileName: 'WCAG_2_1', humanReadableName: 'WCAG 2.1', available: false },
];

const RESPONSE = {
    ok: true,
    headers: {
        get: () => 'application/json',
    },
    json: () => PROFILES,
};
//  Simulate fetch behavior
export const getList = () => {
    return new Promise(resolve => resolve(RESPONSE)).then(handleResponse);
};
