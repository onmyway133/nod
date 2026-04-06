import { Command } from 'commander';
import { findNodRoot } from '../core/id.ts';
import { loadAllSummaries } from '../core/store.ts';
import { filterTasks, sortByPriority } from '../core/query.ts';
import { renderTable } from '../utils/display.ts';
import type { TaskType, Status, Priority } from '../core/types.ts';

export const listCommand = new Command('list')
  .description('List tasks with optional filters')
  .option('--type <type>', 'Filter by type: epic, task, subtask, bug')
  .option('--status <status>', 'Filter by status: todo, in-progress, backlog, done, cancelled')
  .option('--priority <priority>', 'Filter by priority: critical, high, medium, low')
  .option('--parent <id>', 'Filter by parent task ID')
  .option('--tags <tags>', 'Filter by tags (comma-separated, all must match)')
  .option('--json', 'Output as JSON')
  .action((opts) => {
    const root = findNodRoot(process.cwd());
    const all = loadAllSummaries(root);

    const tags = opts.tags
      ? (opts.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean)
      : undefined;

    const filtered = filterTasks(all, {
      type: opts.type as TaskType | undefined,
      status: opts.status as Status | undefined,
      priority: opts.priority as Priority | undefined,
      parent: opts.parent as string | undefined,
      tags,
    });

    const sorted = sortByPriority(filtered);

    if (opts.json) {
      console.log(JSON.stringify(sorted, null, 2));
    } else {
      console.log(renderTable(sorted));
    }
  });
