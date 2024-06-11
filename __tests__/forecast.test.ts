/* eslint-disable no-underscore-dangle */
import { MockServer } from 'jest-mock-server';
import ForecastSolar from '../src/forecastSolar';
import { loadFixtureJSON } from './utils';

describe('forecast-solar-ts class', () => {
    it('should have a constructor', () => {
        const instance = new ForecastSolar({
            azimuth: 0, declination: 0, kwp: 0, latitude: 0, longitude: 0,
        });
        expect(instance).toBeInstanceOf(ForecastSolar);
    });
});

describe('The request method should work correctly', () => {
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

    it('should handle json correctly', async () => {
        const route = mockServer.get('/test')
            .mockImplementationOnce((ctx) => {
                ctx.status = 200;
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
            dampingEvening: 0,
            dampingMorning: 0,
        });

        const result = await instance.request('test');

        expect(result.status).toBe(200);
        expect(result.data).toEqual(loadFixtureJSON('forecast.jsonc'));
        expect(result._res.headers.get('X-Ratelimit-Limit')).toBe('100');
        expect(result._res.headers.get('X-Ratelimit-Period')).toBe('60');
        expect(result._res.headers.get('X-Ratelimit-Remaining')).toBe('99');
        expect(result._res.headers.get('Content-Type')).toContain('application/json');

        expect(route).toHaveBeenCalledTimes(1);
    });
});
