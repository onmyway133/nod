import type { QueryOptions, Status, TaskSummary, TreeNode } from './types.ts';

export function filterTasks(tasks: TaskSummary[], opts: QueryOptions): TaskSummary[] {
  return tasks.filter((t) => {
    if (opts.type && t.type !== opts.type) return false;
    if (opts.status && t.status !== opts.status) return false;
    if (opts.priority && t.priority !== opts.priority) return false;
    if (opts.parent !== undefined && t.parent !== opts.parent) return false;
    if (opts.tags && opts.tags.length > 0) {
      const taskTags = t.tags ?? [];
      if (!opts.tags.every((tag) => taskTags.includes(tag))) return false;
    }
    return true;
  });
}

export function getChildren(tasks: TaskSummary[], parentId: string): TaskSummary[] {
  return tasks.filter((t) => t.parent === parentId);
}

export function getDescendants(tasks: TaskSummary[], rootId: string): TaskSummary[] {
  const result: TaskSummary[] = [];
  const children = getChildren(tasks, rootId);
  for (const child of children) {
    result.push(child);
    result.push(...getDescendants(tasks, child.id));
  }
  return result;
}

const AVAILABLE_STATUSES: Status[] = ['todo', 'in-progress'];

export function getAvailable(tasks: TaskSummary[], opts?: Partial<QueryOptions>): TaskSummary[] {
  const base = tasks.filter((t) => AVAILABLE_STATUSES.includes(t.status));
  if (!opts) return base;
  return filterTasks(base, opts);
}

export function getBacklog(tasks: TaskSummary[], opts?: Partial<QueryOptions>): TaskSummary[] {
  const base = tasks.filter((t) => t.status === 'backlog');
  if (!opts) return base;
  return filterTasks(base, opts);
}

export function buildTree(tasks: TaskSummary[], rootId: string): TreeNode | null {
  const root = tasks.find((t) => t.id === rootId);
  if (!root) return null;
  return buildNode(tasks, root, new Set([rootId]));
}

function buildNode(tasks: TaskSummary[], task: TaskSummary, seen: Set<string>): TreeNode {
  const children = getChildren(tasks, task.id)
    .filter((child) => !seen.has(child.id))
    .map((child) => buildNode(tasks, child, new Set([...seen, child.id])));
  return { task, children };
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortByPriority(tasks: TaskSummary[]): TaskSummary[] {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    if (pa !== pb) return pa - pb;
    return a.created.localeCompare(b.created);
  });
}
