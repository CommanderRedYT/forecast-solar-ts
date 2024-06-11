import moment from 'moment';
import { timedValue, intervalValueSum } from '../src/helper';
import { ForecastSolarData } from '../src/types';
import { loadFixtureJSON } from './utils';

const testData: ForecastSolarData = loadFixtureJSON('forecast.jsonc').result.watts;

const existingMoment = moment(Object.keys(testData)[25]);

const nonExistingMoment = moment('2024-06-01T04:53:46+02:00');

const futureMoment = nonExistingMoment.clone().add(10, 'years');

describe('Test timedValue', () => {
    it('should return a value', () => {
        const result = timedValue(existingMoment, testData);

        expect(result).not.toBeNull();
        expect(result).toBe(250);
    });

    it('should return null', () => {
        const result = timedValue(nonExistingMoment, testData);

        expect(result).toBeNull();
    });

    it('should return null because too new', () => {
        const result = timedValue(futureMoment, testData);

        expect(result).toBeNull();
    });
});

describe('Test intervalValueSum', () => {
    it('should return the correct value', () => {
        // Define a start and end moment for the interval
        const intervalStart = moment(Object.keys(testData)[0]);
        const intervalEnd = moment(Object.keys(testData)[10]);

        // Call the function with the interval and the test data
        const result = intervalValueSum(intervalStart, intervalEnd, testData);

        // Define the expected result by manually summing up the values in the interval
        let expectedSum = 0;
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 10; i++) {
            expectedSum += testData[Object.keys(testData)[i]];
        }

        // Check if the result matches the expected sum
        expect(result).toEqual(expectedSum);
    });
});
