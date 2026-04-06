import chalk from 'chalk';
import type { Status, Priority, Task, TaskSummary, TreeNode } from '../core/types.ts';

const STATUS_COLOR: Record<Status, (s: string) => string> = {
  todo: chalk.gray,
  'in-progress': chalk.yellow,
  backlog: chalk.magenta,
  done: chalk.green,
  cancelled: chalk.dim,
};

const PRIORITY_COLOR: Record<Priority, (s: string) => string> = {
  critical: (s) => chalk.red.bold(s),
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.gray,
};

export function colorStatus(status: Status): string {
  return (STATUS_COLOR[status] ?? chalk.white)(status);
}

export function colorPriority(priority: Priority): string {
  return (PRIORITY_COLOR[priority] ?? chalk.white)(priority);
}

export function renderTable(tasks: TaskSummary[]): string {
  if (tasks.length === 0) return chalk.dim('No tasks found.');

  const headers = ['ID', 'TYPE', 'STATUS', 'PRIORITY', 'TITLE'];
  const rows = tasks.map((t) => [
    t.id,
    t.type,
    t.status,
    t.priority,
    t.title,
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] ?? '').length))
  );

  const pad = (s: string, w: number) => s.padEnd(w);

  const header = headers.map((h, i) => chalk.bold(pad(h, widths[i] ?? h.length))).join('  ');
  const sep = widths.map((w) => '─'.repeat(w)).join('──');

  const lines = [header, sep];
  for (const [i, row] of rows.entries()) {
    const task = tasks[i]!;
    const cols = [
      chalk.cyan(pad(row[0] ?? '', widths[0] ?? 0)),
      chalk.dim(pad(row[1] ?? '', widths[1] ?? 0)),
      colorStatus(task.status).padEnd((widths[2] ?? 0) + colorStatus(task.status).length - task.status.length),
      colorPriority(task.priority).padEnd((widths[3] ?? 0) + colorPriority(task.priority).length - task.priority.length),
      task.status === 'done' || task.status === 'cancelled'
        ? chalk.dim(task.title)
        : task.title,
    ];
    lines.push(cols.join('  '));
  }

  return lines.join('\n');
}

export function renderTaskDetail(task: Task): string {
  const lines: string[] = [];

  lines.push(chalk.bold.cyan(`${task.id}`) + chalk.dim(` · ${task.type}`));
  lines.push(`${chalk.bold('Title:')}    ${task.title}`);
  lines.push(`${chalk.bold('Status:')}   ${colorStatus(task.status)}`);
  lines.push(`${chalk.bold('Priority:')} ${colorPriority(task.priority)}`);
  if (task.parent) {
    lines.push(`${chalk.bold('Parent:')}   ${chalk.cyan(task.parent)}`);
  }
  if (task.related && task.related.length > 0) {
    lines.push(`${chalk.bold('Related:')}  ${task.related.map((r) => chalk.cyan(r)).join(', ')}`);
  }
  if (task.tags && task.tags.length > 0) {
    lines.push(`${chalk.bold('Tags:')}     ${task.tags.map((t) => chalk.magenta(t)).join(', ')}`);
  }
  lines.push(`${chalk.bold('Created:')}  ${task.created}  ${chalk.bold('Updated:')} ${task.updated}`);
  lines.push('─'.repeat(50));
  lines.push(task.body.trimStart());

  return lines.join('\n');
}

export function renderTree(node: TreeNode): string {
  const { task } = node;
  const statusStr = colorStatus(task.status);
  const rootLine = `${chalk.cyan(task.id)} [${statusStr}] ${task.title}`;
  const childLines = node.children.map((child, idx) =>
    renderTreeNode(child, '', idx === node.children.length - 1)
  );
  return [rootLine, ...childLines].join('\n');
}

function renderTreeNode(node: TreeNode, prefix: string, isLast: boolean): string {
  const connector = isLast ? '└── ' : '├── ';
  const childPrefix = isLast ? '    ' : '│   ';
  const { task } = node;
  const statusStr = colorStatus(task.status);
  const line = `${prefix}${connector}${chalk.cyan(task.id)} [${statusStr}] ${task.title}`;
  const childLines = node.children.map((child, idx) =>
    renderTreeNode(child, prefix + childPrefix, idx === node.children.length - 1)
  );
  return [line, ...childLines].join('\n');
}
