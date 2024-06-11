import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    cjsInterop: true,
    sourcemap: true,
    clean: true,
    minify: !options.watch,
}));
