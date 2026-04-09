import { Command } from 'commander';
import chalk from 'chalk';
import { findNodRoot, nextCounter, generateId, generateFilename } from '../core/id.ts';
import { createTask, findById, loadAllSummaries } from '../core/store.ts';
import type { TaskFrontmatter, TaskType, Priority } from '../core/types.ts';
import { ALLOWED_PARENTS, TASK_TYPES, PRIORITIES } from '../core/types.ts';
import { ValidationError } from '../utils/errors.ts';

export const createCommand = new Command('create')
  .description('Create a new task')
  .argument('<type>', `Task type: ${TASK_TYPES.join(', ')}`)
  .argument('<title>', 'Task title')
  .option('-p, --priority <priority>', 'Priority: critical, high, medium, low', 'medium')
  .option('--parent <id>', 'Parent task ID')
  .option('-t, --tags <tags>', 'Comma-separated tags')
  .action((type: string, title: string, opts) => {
    if (!TASK_TYPES.includes(type as TaskType)) {
      throw new ValidationError(`Invalid type "${type}". Must be one of: ${TASK_TYPES.join(', ')}`);
    }
    if (!PRIORITIES.includes(opts.priority as Priority)) {
      throw new ValidationError(`Invalid priority "${opts.priority}". Must be one of: ${PRIORITIES.join(', ')}`);
    }

    const taskType = type as TaskType;
    const priority = opts.priority as Priority;
    const root = findNodRoot(process.cwd());
    const all = loadAllSummaries(root);

    // Validate parent
    if (opts.parent) {
      const parent = all.find((t) => t.id === opts.parent);
      if (!parent) {
        throw new ValidationError(`Parent task not found: ${opts.parent}`);
      }
      const allowed = ALLOWED_PARENTS[taskType];
      if (!allowed.includes(parent.type)) {
        throw new ValidationError(
          `Cannot create ${taskType} under ${parent.type} (${opts.parent}). ` +
          `Allowed parents: ${allowed.length ? allowed.join(', ') : 'none'}`
        );
      }
    } else {
      // Epics must have no parent
      const allowed = ALLOWED_PARENTS[taskType];
      if (allowed.length > 0 && taskType !== 'bug') {
        // task and subtask strongly benefit from a parent but we allow it without one
      }
    }

    const tags = opts.tags ? (opts.tags as string).split(',').map((t: string) => t.trim()).filter(Boolean) : undefined;
    const today = new Date().toISOString().slice(0, 10);
    const counter = nextCounter(root);
    const id = generateId(taskType, counter);
    const filename = generateFilename(taskType, counter, title);

    const frontmatter: TaskFrontmatter = {
      id,
      title,
      type: taskType,
      status: 'todo',
      priority,
      created: today,
      updated: today,
      ...(opts.parent ? { parent: opts.parent } : {}),
      ...(tags && tags.length ? { tags } : {}),
    };

    const task = createTask(root, frontmatter, filename);
    console.log(chalk.green(`Created ${id}`) + ` → .nod/tasks/${filename}`);
    if (opts.parent) {
      console.log(chalk.dim(`  Parent: ${opts.parent}`));
    }
  });
