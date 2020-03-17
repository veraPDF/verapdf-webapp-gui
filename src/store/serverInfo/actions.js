import { createAction } from 'redux-actions';
import { getInfo } from '../../services/fileSvc';

const setServerInfo = createAction('SERVER_INFO_SET');

export const updateServerStatus = () => async dispatch => {
    let serverStatus = {
        fileService: {
            available: undefined,
            build: undefined,
        },
    };

    let response = await getInfo();
    if (response.ok) {
        let { build } = await response.json();
        serverStatus.fileService.available = true;
        serverStatus.fileService.build = build;
    } else {
        serverStatus.fileService.available = false;
    }

    dispatch(setServerInfo(serverStatus));
};
