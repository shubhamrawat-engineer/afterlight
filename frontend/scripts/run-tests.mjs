import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

/**
 * Register synchronous module resolution hook so Node 24's native TypeScript
 * runner can resolve extensionless imports (`./foo` -> `./foo.ts` / `./foo.tsx`)
 * across `src/` and `tests/`.
 */
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      context.parentURL &&
      !path.extname(specifier)
    ) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const candidateBase = path.resolve(parentDir, specifier);
      for (const ext of ['.ts', '.tsx', '.js', '.mjs']) {
        const candidatePath = `${candidateBase}${ext}`;
        if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
          return nextResolve(pathToFileURL(candidatePath).href, context);
        }
      }
      for (const ext of ['.ts', '.tsx', '.js']) {
        const indexCandidate = path.join(candidateBase, `index${ext}`);
        if (fs.existsSync(indexCandidate) && fs.statSync(indexCandidate).isFile()) {
          return nextResolve(pathToFileURL(indexCandidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
});

const formattersTestUrl = pathToFileURL(
  path.join(projectRoot, 'tests', 'unit', 'formatters.test.ts')
).href;

const compatibilityTestUrl = pathToFileURL(
  path.join(projectRoot, 'tests', 'unit', 'compatibility.test.ts')
).href;

const multiEpochTestUrl = pathToFileURL(
  path.join(projectRoot, 'tests', 'unit', 'multi-epoch.test.ts')
).href;

const evidenceTestUrl = pathToFileURL(
  path.join(projectRoot, 'tests', 'unit', 'evidence.test.ts')
).href;

const investigationsPhase6TestUrl = pathToFileURL(
  path.join(projectRoot, 'tests', 'unit', 'investigations-phase6.test.ts')
).href;

const cosmosAiPhase7TestUrl = pathToFileURL(
  path.join(projectRoot, 'tests', 'unit', 'cosmos-ai-phase7.test.ts')
).href;

await import(formattersTestUrl);
await import(compatibilityTestUrl);
await import(multiEpochTestUrl);
await import(evidenceTestUrl);
await import(investigationsPhase6TestUrl);
await import(cosmosAiPhase7TestUrl);
