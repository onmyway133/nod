import { describe, it, expect } from 'bun:test';
import type { TaskSummary } from '../../core/types.ts';
import {
  filterTasks,
  getChildren,
  getDescendants,
  getAvailable,
  sortByPriority,
} from '../../core/query.ts';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTask(overrides: Partial<TaskSummary> & { id: string }): TaskSummary {
  return {
    id: overrides.id,
    title: overrides.title ?? `Task ${overrides.id}`,
    type: overrides.type ?? 'task',
    status: overrides.status ?? 'todo',
    priority: overrides.priority ?? 'medium',
    created: overrides.created ?? '2024-01-01',
    updated: overrides.updated ?? '2024-01-01',
    filePath: `/tasks/${overrides.id}.md`,
    parent: overrides.parent,
    tags: overrides.tags,
  };
}

const tasks: TaskSummary[] = [
  makeTask({ id: 'epic-1',    type: 'epic',    status: 'in-progress', priority: 'critical', tags: ['frontend'] }),
  makeTask({ id: 'task-1',    type: 'task',    status: 'todo',        priority: 'high',     parent: 'epic-1', tags: ['frontend', 'auth'] }),
  makeTask({ id: 'task-2',    type: 'task',    status: 'in-progress', priority: 'medium',   parent: 'epic-1' }),
  makeTask({ id: 'subtask-1', type: 'subtask', status: 'todo',        priority: 'low',      parent: 'task-1' }),
  makeTask({ id: 'subtask-2', type: 'subtask', status: 'done',        priority: 'low',      parent: 'task-1' }),
  makeTask({ id: 'bug-1',     type: 'bug',     status: 'backlog',     priority: 'high',     tags: ['auth'] }),
  makeTask({ id: 'task-3',    type: 'task',    status: 'cancelled',   priority: 'low' }),
];

// ---------------------------------------------------------------------------
// filterTasks
// ---------------------------------------------------------------------------

describe('filterTasks', () => {
  it('filters by type', () => {
    const result = filterTasks(tasks, { type: 'subtask' });
    expect(result.map(t => t.id)).toEqual(['subtask-1', 'subtask-2']);
  });

  it('filters by status', () => {
    const result = filterTasks(tasks, { status: 'todo' });
    expect(result.map(t => t.id)).toEqual(['task-1', 'subtask-1']);
  });

  it('filters by priority', () => {
    const result = filterTasks(tasks, { priority: 'high' });
    expect(result.map(t => t.id)).toEqual(['task-1', 'bug-1']);
  });

  it('filters by parent', () => {
    const result = filterTasks(tasks, { parent: 'task-1' });
    expect(result.map(t => t.id)).toEqual(['subtask-1', 'subtask-2']);
  });

  it('filters by tags (single tag)', () => {
    const result = filterTasks(tasks, { tags: ['auth'] });
    expect(result.map(t => t.id)).toEqual(['task-1', 'bug-1']);
  });

  it('filters by multiple tags (AND logic)', () => {
    const result = filterTasks(tasks, { tags: ['frontend', 'auth'] });
    expect(result.map(t => t.id)).toEqual(['task-1']);
  });

  it('applies multiple filters with AND logic', () => {
    const result = filterTasks(tasks, { type: 'task', status: 'in-progress' });
    expect(result.map(t => t.id)).toEqual(['task-2']);
  });

  it('returns empty array when no tasks match', () => {
    const result = filterTasks(tasks, { type: 'bug', status: 'done' });
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getChildren
// ---------------------------------------------------------------------------

describe('getChildren', () => {
  it('returns only direct children', () => {
    const result = getChildren(tasks, 'task-1');
    expect(result.map(t => t.id)).toEqual(['subtask-1', 'subtask-2']);
  });

  it('does not include grandchildren', () => {
    const result = getChildren(tasks, 'epic-1');
    expect(result.map(t => t.id)).toEqual(['task-1', 'task-2']);
    // subtask-1 and subtask-2 must NOT appear
    expect(result.find(t => t.id === 'subtask-1')).toBeUndefined();
  });

  it('returns empty array for a leaf task', () => {
    expect(getChildren(tasks, 'subtask-1')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getDescendants
// ---------------------------------------------------------------------------

describe('getDescendants', () => {
  it('recurses through all levels', () => {
    const result = getDescendants(tasks, 'epic-1');
    const ids = result.map(t => t.id);
    expect(ids).toContain('task-1');
    expect(ids).toContain('task-2');
    expect(ids).toContain('subtask-1');
    expect(ids).toContain('subtask-2');
    expect(ids).toHaveLength(4);
  });

  it('returns direct children plus their children', () => {
    const result = getDescendants(tasks, 'task-1');
    expect(result.map(t => t.id)).toEqual(['subtask-1', 'subtask-2']);
  });
});

// ---------------------------------------------------------------------------
// getAvailable
// ---------------------------------------------------------------------------

describe('getAvailable', () => {
  it('only returns todo and in-progress tasks', () => {
    const result = getAvailable(tasks);
    const statuses = [...new Set(result.map(t => t.status))];
    expect(statuses.sort()).toEqual(['in-progress', 'todo']);
  });

  it('excludes backlog tasks', () => {
    const result = getAvailable(tasks);
    expect(result.find(t => t.status === 'backlog')).toBeUndefined();
  });

  it('excludes done tasks', () => {
    const result = getAvailable(tasks);
    expect(result.find(t => t.status === 'done')).toBeUndefined();
  });

  it('excludes cancelled tasks', () => {
    const result = getAvailable(tasks);
    expect(result.find(t => t.status === 'cancelled')).toBeUndefined();
  });

  it('supports additional query options', () => {
    const result = getAvailable(tasks, { type: 'task' });
    expect(result.every(t => t.type === 'task')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// sortByPriority
// ---------------------------------------------------------------------------

describe('sortByPriority', () => {
  it('puts critical first, then high, medium, low', () => {
    const input = [
      makeTask({ id: 'a', priority: 'low' }),
      makeTask({ id: 'b', priority: 'critical' }),
      makeTask({ id: 'c', priority: 'medium' }),
      makeTask({ id: 'd', priority: 'high' }),
    ];
    const result = sortByPriority(input);
    expect(result.map(t => t.priority)).toEqual(['critical', 'high', 'medium', 'low']);
  });

  it('does not mutate the original array', () => {
    const input = [
      makeTask({ id: 'x', priority: 'low' }),
      makeTask({ id: 'y', priority: 'critical' }),
    ];
    const original = [...input];
    sortByPriority(input);
    expect(input.map(t => t.id)).toEqual(original.map(t => t.id));
  });
});
