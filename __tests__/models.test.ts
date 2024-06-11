import { MockServer } from 'jest-mock-server';
import moment from 'moment';
import { ForecastSolar, ForecastSolarOptions } from '../src';
import { loadFixtureJSON } from './utils';
import { AccountType } from '../src/models';
import {ForecastSolarError} from "../src/errors";

const clientOptions: ForecastSolarOptions = {
    latitude: 48.21,
    longitude: 16.36,
    azimuth: 180,
    declination: 23.44,
    kwp: 5,
};

const subscribedClientOptions: ForecastSolarOptions = {
    apiKey: 'myapikey',
    latitude: 52.16,
    longitude: 4.47,
    azimuth: 10,
    declination: 20,
    kwp: 2.160,
    dampingMorning: 0,
    dampingEvening: 0,
    horizon: '0,0,0,10,10,20,20,30,30',
    inverter: 1.300,
};

describe('Test estimated forecast', () => {
    const mockServer: MockServer = new MockServer();

    beforeAll(async () => {
        await mockServer.start();
    });

    afterAll(async () => {
        await mockServer.stop();
    });

    beforeEach(() => {
        mockServer.reset();
    });

    it('should return a forecast', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-06-11T12:00:00+02:00'));

        const route = mockServer.get('/estimate/48.21/16.36/23.44/180/5').mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        const forecast = await instance.estimate();

        expect(forecast).toMatchSnapshot('snapshot1');
        expect(forecast.timezone).toBe('Europe/Vienna');
        expect(forecast.accountType).toBe(AccountType.Public);

        expect(forecast.energyProductionToday).toBe(2991);
        expect(forecast.energyProductionTomorrow).toBe(2602);

        expect(forecast.powerProductionNow).toBe(289);
        expect(forecast.energyProductionTodayRemaining).toBe(2059);
        expect(forecast.energyCurrentHour).toBe(270);

        expect(forecast.powerHighestPeakTimeToday).toBeInstanceOf(moment);
        expect(forecast.powerHighestPeakTimeToday).toStrictEqual(moment('2024-06-11T14:00:00+02:00'));

        expect(forecast.powerHighestPeakTimeTomorrow).toBeInstanceOf(moment);
        expect(forecast.powerHighestPeakTimeTomorrow).toStrictEqual(moment('2024-06-12T13:00:00+02:00'));

        expect(forecast.sumEnergyProduction(1)).toBe(312);
        expect(forecast.sumEnergyProduction(6)).toBe(1629);
        expect(forecast.sumEnergyProduction(12)).toBe(1789);
        expect(forecast.sumEnergyProduction(24)).toBe(2893);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should return a forecast with subscription', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-04-27T07:00:00+02:00'));

        const route = mockServer.get(`/${subscribedClientOptions.apiKey}/estimate/52.16/4.47/20/10/2.16`).mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast_personal.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...subscribedClientOptions,
            baseEndpoint: url.toString(),
        });

        const subscribedForecast = await instance.estimate();
        expect(subscribedForecast).toMatchSnapshot('snapshot2');
        expect(subscribedForecast.timezone).toBe('Europe/Amsterdam');
        expect(subscribedForecast.accountType).toBe(AccountType.Personal);

        expect(subscribedForecast.energyProductionToday).toBe(5788);
        expect(subscribedForecast.energyProductionTomorrow).toBe(7507);

        expect(subscribedForecast.powerProductionNow).toBe(92);
        expect(subscribedForecast.energyProductionTodayRemaining).toBe(5783);
        expect(subscribedForecast.energyCurrentHour).toBe(96);

        expect(subscribedForecast.powerHighestPeakTimeToday).toBeInstanceOf(moment);
        expect(subscribedForecast.powerHighestPeakTimeToday).toStrictEqual(moment('2024-04-27T13:30:00+02:00'));
        expect(subscribedForecast.powerHighestPeakTimeTomorrow).toBeInstanceOf(moment);

        expect(subscribedForecast.powerHighestPeakTimeTomorrow).toStrictEqual(moment(
            '2024-04-28T14:30:00+02:00',
        ));

        expect(subscribedForecast.sumEnergyProduction(1)).toBe(216);
        expect(subscribedForecast.sumEnergyProduction(6)).toBe(2802);
        expect(subscribedForecast.sumEnergyProduction(12)).toBe(5582);
        expect(subscribedForecast.sumEnergyProduction(24)).toBe(5784);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should return a forecast with professional type', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-04-27T07:00:00+02:00'));

        const route = mockServer.get(`/${subscribedClientOptions.apiKey}/estimate/52.16/4.47/20/10/2.16`).mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast_professional.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...subscribedClientOptions,
            baseEndpoint: url.toString(),
        });

        const subscribedForecast = await instance.estimate();
        expect(subscribedForecast).toMatchSnapshot('snapshot3');
        expect(subscribedForecast.timezone).toBe('Europe/Amsterdam');
        expect(subscribedForecast.accountType).toBe(AccountType.Professional);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should raise an error with invalid data', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-06-11T12:00:00+02:00'));

        const route = mockServer.get('/estimate/48.21/16.36/23.44/180/5').mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('invalid_forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        await expect(instance.estimate()).rejects.toThrowErrorMatchingSnapshot('invalid_data');

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should raise an error because headers are missing', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-06-11T12:00:00+02:00'));

        const route = mockServer.get('/estimate/48.21/16.36/23.44/180/5').mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.body = loadFixtureJSON('invalid_forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        await expect(instance.estimate()).rejects.toThrowErrorMatchingSnapshot('headers_missing');

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should parse the retry-at header', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-06-11T12:00:00+02:00'));

        const route = mockServer.get('/estimate/48.21/16.36/23.44/180/5').mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Retry-At', moment().add(10, 'hours').toISOString());
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        const result = await instance.estimate();

        expect(result.apiRateLimit).toBe(12);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should raise an error because invalid date', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-06-11T12:00:00+02:00'));

        const route = mockServer.get('/estimate/48.21/16.36/23.44/180/5').mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        const invalidDay = moment('2026-06-11T12:00:00+02:00');

        const result = await instance.estimate();

        expect(() => result.dayProduction(invalidDay)).toThrowErrorMatchingSnapshot('invalid_date');

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should raise an error because no time found', async () => {
        jest.useFakeTimers()
            .setSystemTime(new Date('2024-06-11T12:00:00+02:00'));

        const route = mockServer.get('/estimate/48.21/16.36/23.44/180/5').mockImplementationOnce((ctx) => {
            ctx.status = 200;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        const invalidDay = moment('2026-06-11T12:00:00+02:00');

        const result = await instance.estimate();

        expect(() => result.peakProductionTime(invalidDay)).toThrowErrorMatchingSnapshot('no_time_found');

        expect(route).toHaveBeenCalledTimes(1);
    });
});

describe('Test api key validation', () => {
    const mockServer: MockServer = new MockServer();

    beforeAll(async () => {
        await mockServer.start();
    });

    afterAll(async () => {
        await mockServer.stop();
    });

    beforeEach(() => {
        mockServer.reset();
    });

    it('should return true when the API key is valid', async () => {
        const route = mockServer.get(`/${subscribedClientOptions.apiKey}/info`)
            .mockImplementationOnce((ctx) => {
                ctx.status = 200;
                ctx.set('X-Ratelimit-Limit', '100');
                ctx.set('X-Ratelimit-Period', '60');
                ctx.set('X-Ratelimit-Remaining', '99');
                ctx.body = loadFixtureJSON('validate_key.jsonc');
            });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...subscribedClientOptions,
            baseEndpoint: url.toString(),
        });

        await expect(instance.validateApiKey()).resolves.toBe(true);

        expect(route).toHaveBeenCalledTimes(1);
    });
});

describe('Test plane validation', () => {
    const mockServer: MockServer = new MockServer();

    beforeAll(async () => {
        await mockServer.start();
    });

    afterAll(async () => {
        await mockServer.stop();
    });

    beforeEach(() => {
        mockServer.reset();
    });

    it('should return true when the plane is valid', async () => {
        const route = mockServer.get('/check/48.21/16.36/23.44/180/5')
            .mockImplementationOnce((ctx) => {
                ctx.status = 200;
                ctx.set('X-Ratelimit-Limit', '100');
                ctx.set('X-Ratelimit-Period', '60');
                ctx.set('X-Ratelimit-Remaining', '99');
                ctx.body = loadFixtureJSON('validate_plane.jsonc');
            });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            ...clientOptions,
            baseEndpoint: url.toString(),
        });

        await expect(instance.validatePlane()).resolves.toBe(true);

        expect(route).toHaveBeenCalledTimes(1);
    });
});
