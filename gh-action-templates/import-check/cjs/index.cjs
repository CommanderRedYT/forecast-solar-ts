const api = require('forecast-solar-ts');

if (!api) {
    throw new Error('API not found');
}

if (typeof api !== 'function') {
    throw new Error('API is not a class');
}
