import { findNodRoot } from '../core/id.ts';
import { loadAllSummaries, findById, loadTask, writeTask } from '../core/store.ts';
import { seedDemoData } from '../core/seed.ts';
import type { Status, Priority } from '../core/types.ts';
import { STATUSES, PRIORITIES } from '../core/types.ts';
// Bun bundles this as an inline string via the --loader .html:text flag in build.ts
// @ts-ignore — no TS declaration needed at runtime
import html from './app.html';

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function createServer(port: number) {
  const root = findNodRoot(process.cwd());

  return Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      if (url.pathname === '/') {
        return new Response(html as string, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      if (url.pathname === '/api/tasks' && req.method === 'GET') {
        const tasks = loadAllSummaries(root);
        return jsonResponse({ tasks, root });
      }

      if (url.pathname.startsWith('/api/task/') && req.method === 'GET') {
        try {
          const id = url.pathname.split('/')[3];
          if (!id) return jsonResponse({ error: 'Missing id' }, 400);
          const summary = findById(root, id);
          const task = loadTask(summary.filePath);
          return jsonResponse({ task });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return jsonResponse({ error: message }, 404);
        }
      }

      if (url.pathname === '/api/update' && req.method === 'POST') {
        try {
          const body = (await req.json()) as { id: string; field: string; value: string };
          const { id, field, value } = body;

          const summary = findById(root, id);
          const task = loadTask(summary.filePath);

          if (field === 'status') {
            if (!STATUSES.includes(value as Status)) {
              return jsonResponse({ error: `Invalid status: ${value}` }, 400);
            }
            (task as { status: Status }).status = value as Status;
          } else if (field === 'priority') {
            if (!PRIORITIES.includes(value as Priority)) {
              return jsonResponse({ error: `Invalid priority: ${value}` }, 400);
            }
            (task as { priority: Priority }).priority = value as Priority;
          } else if (field === 'title') {
            task.title = value;
          } else {
            return jsonResponse({ error: `Unknown field: ${field}` }, 400);
          }

          writeTask(task);
          return jsonResponse({ task });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return jsonResponse({ error: message }, 500);
        }
      }

      if (url.pathname === '/api/seed' && req.method === 'POST') {
        try {
          const { created } = seedDemoData(root);
          return jsonResponse({ created });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          return jsonResponse({ error: message }, 500);
        }
      }

      return new Response('Not Found', { status: 404 });
    },
  });
}
