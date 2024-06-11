import { MockServer } from 'jest-mock-server';
import {
    ForecastSolarAuthenticationError,
    ForecastSolarConfigError,
    ForecastSolarRequestError,
    ForecastSolarConnectionError,
    ForecastSolarRateLimitError,
} from '../src/errors';
import ForecastSolar from '../src/forecastSolar';
import { loadFixtureJSON } from './utils';

describe('Test errors', () => {
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

    it('should throw a RequestError when the API returns a 400 status code', async () => {
        const route = mockServer.get('/test').mockImplementationOnce((ctx) => {
            ctx.status = 400;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            baseEndpoint: url.toString(),
            latitude: 0,
            longitude: 0,
            azimuth: 0,
            declination: 0,
            kwp: 0,
        });

        await expect(instance.request('test')).rejects.toThrow(ForecastSolarRequestError);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should throw a AuthenticationError when the API returns a 401 status code', async () => {
        const route = mockServer.get('/test').mockImplementationOnce((ctx) => {
            ctx.status = 401;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            baseEndpoint: url.toString(),
            latitude: 0,
            longitude: 0,
            azimuth: 0,
            declination: 0,
            kwp: 0,
        });

        await expect(instance.request('test')).rejects.toThrow(ForecastSolarAuthenticationError);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should throw a ConfigError when the API returns a 422 status code', async () => {
        const route = mockServer.get('/test').mockImplementationOnce((ctx) => {
            ctx.status = 422;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            baseEndpoint: url.toString(),
            latitude: 0,
            longitude: 0,
            azimuth: 0,
            declination: 0,
            kwp: 0,
        });

        await expect(instance.request('test')).rejects.toThrow(ForecastSolarConfigError);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should throw a RateLimitError when the API returns a 429 status code', async () => {
        const route = mockServer.get('/test').mockImplementationOnce((ctx) => {
            ctx.status = 429;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            baseEndpoint: url.toString(),
            latitude: 0,
            longitude: 0,
            azimuth: 0,
            declination: 0,
            kwp: 0,
        });

        await expect(instance.request('test')).rejects.toThrow(ForecastSolarRateLimitError);

        expect(route).toHaveBeenCalledTimes(1);
    });

    it('should throw a ConnectionError when the API returns a 502 status code', async () => {
        const route = mockServer.get('/test').mockImplementationOnce((ctx) => {
            ctx.status = 502;
            ctx.set('X-Ratelimit-Limit', '100');
            ctx.set('X-Ratelimit-Period', '60');
            ctx.set('X-Ratelimit-Remaining', '99');
            ctx.body = loadFixtureJSON('forecast.jsonc');
        });

        const url = mockServer.getURL();

        const instance = new ForecastSolar({
            baseEndpoint: url.toString(),
            latitude: 0,
            longitude: 0,
            azimuth: 0,
            declination: 0,
            kwp: 0,
        });

        await expect(instance.request('test')).rejects.toThrow(ForecastSolarConnectionError);

        expect(route).toHaveBeenCalledTimes(1);
    });
});
