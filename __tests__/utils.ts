import fs from 'fs';
import { jsonc } from 'jsonc';

export const loadFixture = (filename: string): string => {
    const content = fs.readFileSync(`__tests__/fixtures/${filename}`, 'utf-8');

    if (typeof content !== 'string' || content.length < 50) {
        throw new Error('Invalid file!');
    }

    return content;
};
export const loadFixtureJSON = (filename: string): any => jsonc.parse(loadFixture(filename));
