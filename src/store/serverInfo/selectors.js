import { createSelector } from 'reselect';

const getServerInfo = state => state.serverInfo;

export const getServerGeneralStatus = createSelector(getServerInfo, serverInfo => {
    return Object.keys(serverInfo).findIndex(key => key !== 'version' && serverInfo[key].available !== true) === -1;
});
