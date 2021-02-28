import {infoStore} from './functions';

const infoStoreService = new infoStore();

const init = async () => {
    return await infoStoreService.store()
}

init()
    .then(response => {
        console.log(response);
    })
    .catch(err => {
        console.log(err);
    })