/* eslint-disable max-classes-per-file */
export class ForecastSolarError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ForecastSolarConfigError extends ForecastSolarError {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ForecastSolarConnectionError extends ForecastSolarError {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ForecastSolarRequestError extends ForecastSolarError {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ForecastSolarRateLimitError extends ForecastSolarError {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

export class ForecastSolarAuthenticationError extends ForecastSolarError {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}
