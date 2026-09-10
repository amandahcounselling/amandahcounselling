import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const ALLOWED_PREFIXES = ['src/content-data/', 'src/content/', 'public/images/'];

function isAllowedPath(relativePath) {
  return ALLOWED_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

function resolveProjectPath(relativePath) {
  const normalized = relativePath.replace(/^\/+/, '');
  if (!isAllowedPath(normalized)) {
    throw new Error('Path is not allowed.');
  }

  const absolutePath = path.resolve(projectRoot, normalized);
  if (!absolutePath.startsWith(projectRoot + path.sep)) {
    throw new Error('Path escapes project root.');
  }

  return absolutePath;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function isLocalAdminEditingEnabled(mode) {
  const env = loadEnv(mode, projectRoot, '');
  const value = env.PUBLIC_ADMIN_LOCAL_EDITING ?? process.env.PUBLIC_ADMIN_LOCAL_EDITING;
  return value === 'true' || value === '1';
}

/** Dev-only middleware: write admin edits directly to the working tree. */
export function adminDevPlugin() {
  return {
    name: 'admin-dev',
    apply: 'serve',
    configureServer(server) {
      if (!isLocalAdminEditingEnabled(server.config.mode)) {
        return;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__admin/')) {
          next();
          return;
        }

        try {
          const url = new URL(req.url, 'http://localhost');

          if (req.method === 'GET' && url.pathname === '/__admin/content/file') {
            const relativePath = url.searchParams.get('path') ?? '';
            const absolutePath = resolveProjectPath(relativePath);
            const content = await fs.readFile(absolutePath, 'utf8');
            sendJson(res, 200, { path: relativePath, content });
            return;
          }

          if (req.method === 'GET' && url.pathname === '/__admin/content/list') {
            const relativePath = url.searchParams.get('path') ?? '';
            const absolutePath = resolveProjectPath(relativePath);
            const entries = await fs.readdir(absolutePath, { withFileTypes: true });
            sendJson(res, 200, {
              entries: entries.map((entry) => ({
                name: entry.name,
                path: path.posix.join(relativePath.replace(/\\/g, '/'), entry.name),
                type: entry.isDirectory() ? 'dir' : 'file',
              })),
            });
            return;
          }

          if (req.method === 'PUT' && url.pathname === '/__admin/content/file') {
            const body = JSON.parse((await readBody(req)).toString('utf8'));
            if (!body.path || typeof body.content !== 'string') {
              sendJson(res, 400, { error: 'Missing path or content.' });
              return;
            }

            const absolutePath = resolveProjectPath(body.path);
            await fs.mkdir(path.dirname(absolutePath), { recursive: true });
            await fs.writeFile(absolutePath, body.content, 'utf8');
            sendJson(res, 200, { path: body.path, saved: true });
            return;
          }

          if (req.method === 'POST' && url.pathname === '/__admin/content/upload') {
            const body = JSON.parse((await readBody(req)).toString('utf8'));
            if (!body.path || !body.contentBase64) {
              sendJson(res, 400, { error: 'Missing path or contentBase64.' });
              return;
            }

            const absolutePath = resolveProjectPath(body.path);
            await fs.mkdir(path.dirname(absolutePath), { recursive: true });
            await fs.writeFile(absolutePath, Buffer.from(body.contentBase64, 'base64'));
            sendJson(res, 200, { path: body.path, saved: true });
            return;
          }

          sendJson(res, 404, { error: 'Not found.' });
        } catch (error) {
          sendJson(res, 500, {
            error: error instanceof Error ? error.message : 'Admin dev request failed.',
          });
        }
      });
    },
  };
}
