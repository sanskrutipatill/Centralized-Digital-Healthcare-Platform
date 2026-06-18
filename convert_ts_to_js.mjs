import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';
import * as babel from '@babel/core';

const srcDir = path.resolve(process.cwd(), 'src');
console.log(`Scanning directory: ${srcDir}`);

const tsFiles = globSync('src/**/*.{ts,tsx}', { cwd: process.cwd(), absolute: true });

console.log(`Found ${tsFiles.length} TypeScript files to convert.`);

for (const file of tsFiles) {
  try {
    const isTSX = file.endsWith('.tsx');
    const result = babel.transformFileSync(file, {
      presets: [
        ['@babel/preset-typescript', { isTSX, allExtensions: true }]
      ],
      retainLines: true, // Try to retain formatting and line numbers
      generatorOpts: {
        retainLines: true,
        comments: true,
      }
    });

    if (result && result.code != null) {
      // Determine new file path
      const ext = path.extname(file);
      const newExt = ext === '.tsx' ? '.jsx' : '.js';
      const newFile = file.slice(0, -ext.length) + newExt;
      
      // Write new JS file
      fs.writeFileSync(newFile, result.code);
      console.log(`✅ Converted ${path.basename(file)} -> ${path.basename(newFile)}`);
      
      // Delete old TS file
      fs.unlinkSync(file);
    }
  } catch (err) {
    console.error(`❌ Failed to convert ${file}`, err);
  }
}

console.log('Conversion complete!');
