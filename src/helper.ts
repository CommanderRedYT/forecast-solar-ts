import moment, { Moment } from 'moment';
import { ForecastSolarData } from './types';

/*
def _timed_value(at: datetime, data: dict[datetime, int]) -> int | None:
    """Return the value for a specific time."""
    value = None
    for timestamp, cur_value in data.items():
        if timestamp > at:
            return value
        value = cur_value

    return None

    def _interval_value_sum(
    interval_begin: datetime, interval_end: datetime, data: dict[datetime, int]
) -> int:
    """Return the sum of values in interval."""
    total = 0

    for timestamp, wh in data.items():
        # Skip all until this hour
        if timestamp < interval_begin:
            continue

        if timestamp >= interval_end:
            break

        total += wh

    return total
 */

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
