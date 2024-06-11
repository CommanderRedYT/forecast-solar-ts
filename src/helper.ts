import moment, { Moment } from 'moment';
import { ForecastSolarData } from './types';

export function timedValue(at: Moment, data: ForecastSolarData): number | null {
    let value: number | null = null;
    for (const [timestamp, curValue] of Object.entries(data)) {
        const timestampMoment = moment(timestamp);

        if (timestampMoment > at) {
            return value;
        }
        value = curValue;
    }

    return null;
}

export function intervalValueSum(intervalBegin: Moment, intervalEnd: Moment, data: ForecastSolarData): number {
    let total = 0;

    for (const [timestamp, wh] of Object.entries(data)) {
        const timestampMoment = moment(timestamp);

        if (timestampMoment < intervalBegin) {
            continue;
        }

        if (timestampMoment >= intervalEnd) {
            break;
        }

        total += wh;
    }

    return total;
}
