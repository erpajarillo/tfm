import {pollutionCalculator} from './functions';

const pollCalc = new pollutionCalculator();

const init = async () => {
    return await pollCalc.calculate()
}

init()
    .then(response => {
        console.log(response);
    })
    .catch(err => {
        console.log(err);
    })