import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('node_modules/@coderline/alphatab/dist/font');
const destination = resolve('public/alphatab/font');

await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true, force: true });
