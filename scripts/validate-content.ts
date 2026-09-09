import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { practiceSchema } from '../src/content-data/practice.schema.ts';

const root = path.resolve(import.meta.dirname, '..');
const contentDataDir = path.join(root, 'src/content-data');

async function loadJson(filePath: string) {
  const raw = await readFile(filePath, 'utf8');
  return JSON.parse(raw) as unknown;
}

async function walkJsonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkJsonFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  const jsonFiles = await walkJsonFiles(contentDataDir);
  let failed = false;

  for (const filePath of jsonFiles) {
    const relativePath = path.relative(root, filePath);
    const data = await loadJson(filePath);

    if (relativePath === 'src/content-data/practice.json') {
      const result = practiceSchema.safeParse(data);
      if (!result.success) {
        failed = true;
        console.error(`Invalid ${relativePath}:`, result.error.flatten());
      }
      continue;
    }

    const schemaPath = filePath.replace(/\.json$/, '.schema.ts');
    try {
      const module = await import(pathToFileURL(schemaPath).href);
      const schema = module.default ?? module.schema;
      if (!schema?.safeParse) {
        console.warn(`Skipping ${relativePath}: no schema found at ${schemaPath}`);
        continue;
      }
      const result = schema.safeParse(data);
      if (!result.success) {
        failed = true;
        console.error(`Invalid ${relativePath}:`, result.error.flatten());
      }
    } catch {
      console.warn(`Skipping ${relativePath}: no schema found at ${schemaPath}`);
    }
  }

  if (failed) {
    process.exit(1);
  }

  console.log(`Validated ${jsonFiles.length} content files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
