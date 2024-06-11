export interface ForecastSolarOptions {
    azimuth: number;
    declination: number;
    kwp: number;
    latitude: number;
    longitude: number;
    apiKey?: string;
    damping?: number;
    dampingMorning?: number;
    dampingEvening?: number;
    horizon?: string;
    inverter?: number;
    baseEndpoint?: string;
}

export interface ForecastSolarData {
    [key: string]: number;
}
