import {pollutionCalculator} from './functions';

const pollCalc = new pollutionCalculator();

const init = async () => {
    const response = await pollCalc.calculate()
}

init()
    .then(() => {
        console.log('OK');
    })
    .catch(err => {
        console.log(err);
    })