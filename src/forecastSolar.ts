import type { ForecastSolarOptions } from './types';

import {
    ForecastSolarConnectionError, ForecastSolarRequestError, ForecastSolarAuthenticationError, ForecastSolarConfigError, ForecastSolarRateLimitError,
} from './errors';
import {
    Estimate, RateLimit, RequestOptions, ResponseData,
} from './models';

class ForecastSolar {
    azimuth: number;
    declination: number;
    kwp: number;
    latitude: number;
    longitude: number;

    apiKey: string | null = null;
    damping: number = 0;
    dampingMorning: number | null = null;
    dampingEvening: number | null = null;
    horizon: string | null = null;

    inverter: number | null = null;

    rateLimit: RateLimit | null = null;

    baseEndpoint = 'https://api.forecast.solar/';

    constructor(options: ForecastSolarOptions) {
        this.azimuth = options.azimuth;
        this.declination = options.declination;
        this.kwp = options.kwp;
        this.latitude = options.latitude;
        this.longitude = options.longitude;
        this.apiKey = options.apiKey || null;
        this.damping = options.damping || 0;
        this.dampingMorning = options.dampingMorning || null;
        this.dampingEvening = options.dampingEvening || null;
        this.horizon = options.horizon || null;
        this.inverter = options.inverter || null;

        if (options.baseEndpoint) {
            this.baseEndpoint = options.baseEndpoint;
        }
    }

    public async request(endpoint: string, options?: RequestOptions): Promise<ResponseData> {
        // @ts-ignore
        const { rateLimit, authenticate, params } = {
            rateLimit: true, authenticate: true, params: null, ...options,
        };
        const url = new URL(this.baseEndpoint);

        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };

        if (authenticate && typeof this.apiKey === 'string') {
            url.pathname = `${this.apiKey}${url.pathname}`;
        }

        url.pathname += endpoint;

        if (params !== null) {
            url.search = params.toString();
        }

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers,
        });

        // console.log('response', url.toString(), response.status, response.headers);

        if ([502, 503].includes(response.status)) {
            throw new ForecastSolarConnectionError('The Forecast.Solar API is currently unavailable');
        }

        if (response.status === 400) {
            const data = await response.json();
            throw new ForecastSolarRequestError(data.message);
        }

        if ([401, 403].includes(response.status)) {
            const data = await response.json();
            throw new ForecastSolarAuthenticationError(data.message);
        }

        if (response.status === 422) {
            const data = await response.json();
            throw new ForecastSolarConfigError(data.message);
        }

        if (response.status === 429) {
            const data = await response.json();
            throw new ForecastSolarRateLimitError(data.message);
        }

        if (rateLimit && response.status < 500) {
            this.rateLimit = RateLimit.fromResponse(response);
        }

        return {
            data: await response.json(),
            status: response.status,
            _res: response,
        };
    }

    public async validatePlane(): Promise<boolean> {
        await this.request(`check/${this.latitude}/${this.longitude}/${this.declination}/${this.azimuth}/${this.kwp}`, {
            authenticate: false,
            rateLimit: false,
        });

        return true;
    }

    public async validateApiKey(): Promise<boolean> {
        await this.request('info');

        return true;
    }

    public async estimate(): Promise<Estimate> {
        const params = new URLSearchParams({
            time: 'iso8601',
            damping: this.damping.toString(),
        });

        if (this.inverter !== null) {
            params.append('inverter', this.inverter.toString());
        }

        if (this.horizon !== null) {
            params.append('horizon', this.horizon);
        }

        if (this.dampingMorning !== null && this.dampingEvening !== null) {
            params.append('dampingMorning', this.dampingMorning.toString());
            params.append('dampingEvening', this.dampingEvening.toString());
        }

        const { data } = await this.request(`estimate/${this.latitude}/${this.longitude}/${this.declination}/${this.azimuth}/${this.kwp}`, {
            params,
        });

        return Estimate.fromData(data);
    }
}

export default ForecastSolar;
