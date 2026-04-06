import { Command } from 'commander';
import chalk from 'chalk';
import * as path from 'path';
import { findNodRoot, generateFilename } from '../core/id.ts';
import { findById, loadTask, writeTask, renameTask } from '../core/store.ts';
import type { Status, Priority } from '../core/types.ts';
import { STATUSES, PRIORITIES } from '../core/types.ts';
import { ValidationError } from '../utils/errors.ts';

export const updateCommand = new Command('update')
  .description('Update task fields')
  .argument('<id>', 'Task ID')
  .option('--status <status>', 'New status: todo, in-progress, backlog, done, cancelled')
  .option('--priority <priority>', 'New priority: critical, high, medium, low')
  .option('--title <title>', 'New title')
  .option('--tags <tags>', 'Replace tags (comma-separated)')
  .option('--parent <id>', 'Set parent task ID')
  .option('--related <ids>', 'Set related task IDs (comma-separated)')
  .action((id: string, opts) => {
    if (opts.status && !STATUSES.includes(opts.status as Status)) {
      throw new ValidationError(`Invalid status "${opts.status}". Must be one of: ${STATUSES.join(', ')}`);
    }
    if (opts.priority && !PRIORITIES.includes(opts.priority as Priority)) {
      throw new ValidationError(`Invalid priority "${opts.priority}". Must be one of: ${PRIORITIES.join(', ')}`);
    }

    const root = findNodRoot(process.cwd());
    const summary = findById(root, id);
    let task = loadTask(summary.filePath);
    const changes: string[] = [];

    if (opts.status && task.status !== opts.status) {
      changes.push(`status: ${task.status} → ${opts.status}`);
      task = { ...task, status: opts.status as Status };
    }
    if (opts.priority && task.priority !== opts.priority) {
      changes.push(`priority: ${task.priority} → ${opts.priority}`);
      task = { ...task, priority: opts.priority as Priority };
    }
    if (opts.parent !== undefined) {
      changes.push(`parent: ${task.parent ?? 'none'} → ${opts.parent}`);
      task = { ...task, parent: opts.parent || undefined };
    }
    if (opts.related !== undefined) {
      const related = (opts.related as string).split(',').map((s: string) => s.trim()).filter(Boolean);
      task = { ...task, related: related.length ? related : undefined };
      changes.push(`related updated`);
    }
    if (opts.tags !== undefined) {
      const tags = (opts.tags as string).split(',').map((s: string) => s.trim()).filter(Boolean);
      task = { ...task, tags: tags.length ? tags : undefined };
      changes.push(`tags updated`);
    }

    const titleChanged = opts.title && opts.title !== task.title;
    if (titleChanged) {
      changes.push(`title: "${task.title}" → "${opts.title}"`);
      task = { ...task, title: opts.title as string };
    }

    if (changes.length === 0) {
      console.log(chalk.dim(`No changes for ${id}.`));
      return;
    }

    if (titleChanged) {
      // Derive counter from the existing filename (e.g. "task-12-old-title.md" → 12)
      const basename = path.basename(task.filePath, '.md');
      const counterStr = basename.split('-')[1] ?? '';
      const counter = parseInt(counterStr, 10);
      if (isNaN(counter)) {
        throw new ValidationError(`Cannot rename: could not parse counter from filename "${basename}"`);
      }
      const newFilename = generateFilename(task.type, counter, task.title);
      task = renameTask(task, newFilename);
    } else {
      writeTask(task);
    }

    console.log(chalk.green(`Updated ${id}`));
    for (const c of changes) {
      console.log(chalk.dim(`  ${c}`));
    }
  });
