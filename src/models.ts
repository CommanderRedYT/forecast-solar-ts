/* eslint-disable max-classes-per-file */
import moment from 'moment';
import 'moment-timezone';
import { ForecastSolarData } from './types';
import { intervalValueSum, timedValue } from './helper';
import { ForecastSolarError } from './errors';

export interface RequestOptions {
    rateLimit?: boolean;
    authenticate?: boolean;
    params?: URLSearchParams | null;
}

export interface ResponseData {
    status: number;
    data: any;
    _res: Response;
}

export enum AccountType {
    Public = 'public',
    Personal = 'personal',
    Professional = 'professional',
}

export class Estimate {
    watts: ForecastSolarData;
    whPeriod: ForecastSolarData;
    whDays: ForecastSolarData;
    apiRateLimit: number;
    apiTimezone: string;

    constructor(watts: ForecastSolarData, whPeriod: ForecastSolarData, whDays: ForecastSolarData, apiRateLimit: number, apiTimezone: string) {
        this.watts = watts;
        this.whPeriod = whPeriod;
        this.whDays = whDays;
        this.apiRateLimit = apiRateLimit;
        this.apiTimezone = apiTimezone;
    }

    /*
    @classmethod
    def from_dict(cls: type[Estimate], data: dict[str, Any]) -> Estimate:
        """Return a Estimate object from a Forecast.Solar API response.

        Converts a dictionary, obtained from the Forecast.Solar API into
        a Estimate object.

        Args:
        ----
            data: The estimate response from the Forecast.Solar API.

        Returns:
        -------
            An Estimate object.

        """
        return cls(
            watts={
                datetime.fromisoformat(d): w for d, w in data["result"]["watts"].items()
            },
            wh_period={
                datetime.fromisoformat(d): e
                for d, e in data["result"]["watt_hours_period"].items()
            },
            wh_days={
                datetime.fromisoformat(d): e
                for d, e in data["result"]["watt_hours_day"].items()
            },
            api_rate_limit=data["message"]["ratelimit"]["limit"],
            api_timezone=data["message"]["info"]["timezone"],
        )
     */

    static fromData(data: ForecastSolarData): Estimate {
        if (!('result' in data) || !('watts' in (data as any).result) || !('watt_hours_period' in (data as any).result) || !('watt_hours_day' in (data as any).result)) {
            throw new Error('Invalid data format');
        }

        return new Estimate(
            /*
            {
                [(data as any).result.watts.map((d: string) => moment(d).toDate())]: (data as any).result.watts.values(),
            },
            {
                [(data as any).result.watt_hours_period.map((d: string) => moment(d).toDate())]: (data as any).result.watt_hours_period.values(),
            },
            {
                [(data as any).result.watt_hours_day.map((d: string) => moment(d).toDate())]: (data as any).result.watt_hours_day.values(),
            },
            (data as any).message.ratelimit.limit,
            (data as any).message.info.timezone, */
            (data as any).result.watts,
            (data as any).result.watt_hours_period,
            (data as any).result.watt_hours_day,
            (data as any).message.ratelimit.limit,
            (data as any).message.info.timezone,
        );
    }

    now(): moment.Moment {
        return moment().tz(this.apiTimezone);
    }

    get timezone(): string {
        return this.apiTimezone;
    }

    get accountType(): AccountType {
        switch (this.apiRateLimit) {
            case 60:
                return AccountType.Personal;
            case 5:
                return AccountType.Professional;
            default:
                return AccountType.Public;
        }
    }

    get energyProductionToday(): number {
        return this.dayProduction(this.now());
    }

    get energyProductionTomorrow(): number {
        return this.dayProduction(this.now().add(1, 'days'));
    }

    get energyProductionTodayRemaining(): number {
        return intervalValueSum(this.now(), this.now().endOf('day'), this.whPeriod);
    }

    get powerProductionNow(): number | null {
        return this.powerProductionAtTime(this.now());
    }

    get powerHighestPeakTimeToday(): moment.Moment {
        return this.peakProductionTime(this.now());
    }

    get powerHighestPeakTimeTomorrow(): moment.Moment {
        return this.peakProductionTime(this.now().add(1, 'days'));
    }

    get energyCurrentHour(): number {
        return intervalValueSum(this.now().startOf('hour'), this.now().startOf('hour').add(1, 'hours'), this.whPeriod);
    }

    dayProduction(day: moment.Moment): number {
        const specificDate = day.startOf('day');
        const keys = Object.keys(this.whDays);

        const key = keys.find((k) => moment(k).isSame(specificDate, 'day'));

        if (key === undefined) {
            return 0;
        }

        return this.whDays[key];
    }

    peakProductionTime(specificDate: moment.Moment): moment.Moment {
        const filteredValues = Object.entries(this.watts).filter(
            ([timestamp]) => moment(timestamp).isSame(specificDate, 'day'),
        );
        const highestValue = Math.max(...filteredValues.map(([, watt]) => watt));

        for (const [timestamp, watt] of Object.entries(this.watts)) {
            if (watt === highestValue) {
                return moment(timestamp);
            }
        }

        throw new Error('No peak production time found');
    }

    powerProductionAtTime(time: moment.Moment): number | null {
        return timedValue(time, this.watts);
    }

    sumEnergyProduction(periodHours: number): number {
        const now = this.now().set({ minute: 59, second: 59, millisecond: 999 });
        const until = now.clone().add(periodHours, 'hours');

        return intervalValueSum(now, until, this.whPeriod);
    }
}

export class RateLimit {
    callLimit: number;
    remainingCalls: number;
    period: number;
    retryAt: Date | null;

    constructor(callLimit: number, remainingCalls: number, period: number, retryAt: Date | null) {
        this.callLimit = callLimit;
        this.remainingCalls = remainingCalls;
        this.period = period;
        this.retryAt = retryAt;
    }

    static fromResponse(response: Response): RateLimit {
        let limit: string | number | null = response.headers.get('X-Ratelimit-Limit');
        let period: string | number | null = response.headers.get('X-Ratelimit-Period');
        let remaining: string | number | null = response.headers.get('X-Ratelimit-Remaining') ?? '0';
        let retryAt: Date | string | null = response.headers.get('X-Ratelimit-Retry-At');

        if (retryAt !== null) {
            retryAt = new Date(retryAt);
        }

        if (limit === null || period === null) {
            throw new ForecastSolarError('Rate limit headers are missing from the response');
        }

        limit = parseInt(limit, 10);
        period = parseInt(period, 10);
        remaining = parseInt(remaining, 10);

        return new RateLimit(limit, remaining, period, retryAt);
    }
}
