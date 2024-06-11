import fs from 'fs';
import { jsonc } from 'jsonc';

export const loadFixture = (filename: string): string => fs.readFileSync(`__tests__/fixtures/${filename}`, 'utf-8');
export const loadFixtureJSON = (filename: string): any => jsonc.parse(loadFixture(filename));
