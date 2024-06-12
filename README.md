# forecast-solar-ts

![GitHub License](https://img.shields.io/github/license/CommanderRedYT/forecast-solar-ts)
![GitHub issues](https://img.shields.io/github/issues/CommanderRedYT/forecast-solar-ts)
![NPM Version](https://img.shields.io/npm/v/forecast-solar-ts)
![NPM Downloads](https://img.shields.io/npm/dt/forecast-solar-ts)
[![Continuous Integration](https://github.com/CommanderRedYT/forecast-solar-ts/actions/workflows/testing.yml/badge.svg)](https://github.com/CommanderRedYT/forecast-solar-ts/actions/workflows/testing.yml)

This library is a typescript implementation of the [forecast_solar](https://github.com/home-assistant-libs/forecast_solar) library that is used in Home Assistant.
It provides functionality to get solar power estimates from the API provided by [forecast.solar](https://forecast.solar/).

## Testing

The library has a reported 100% test coverage. You can find them in `__tests__` and run them via the following command:

```bash
npm run test
```

## Installation
```bash
# Using npm
npm i --save forecast-solar-ts

# Using yarn
yarn add forecast-solar-ts

# Using pnpm
pnpm add forecast-solar-ts
```

## Usage

#### Usage in ESM
```typescript
import ForecastSolar from 'forecast-solar-ts';

const forecast = new ForecastSolar({
  latitude: 48.21,
  longitude: 16.36,
  azimuth: 180,
  declination: 23.44,
  kwp: 5,
});

forecast.estimate().then((estimate) => {
  console.log(estimate);
});
```

#### Usage in CJS
```javascript
const ForecastSolar = require('forecast-solar-ts');

const forecast = new ForecastSolar({
  latitude: 48.21,
  longitude: 16.36,
  azimuth: 180,
  declination: 23.44,
  kwp: 5,
});

forecast.estimate().then((estimate) => {
  console.log(estimate);
});
```

## Issues

If you find any issues, please report them [here](https://github.com/CommanderRedYT/forecast-solar-ts/issues).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
