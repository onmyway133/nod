import { nextCounter, generateId, generateFilename } from './id.ts';
import { createTask } from './store.ts';
import type { TaskFrontmatter } from './types.ts';

const TODAY = new Date().toISOString().slice(0, 10);

function make(
  root: string,
  fields: Omit<TaskFrontmatter, 'id' | 'created' | 'updated'>
): string {
  const counter = nextCounter(root);
  const id = generateId(fields.type, counter);
  const filename = generateFilename(fields.type, counter, fields.title);
  const frontmatter: TaskFrontmatter = {
    ...fields,
    id,
    created: TODAY,
    updated: TODAY,
  };
  createTask(root, frontmatter, filename);
  return id;
}

export function seedDemoData(root: string): { created: number } {
  let created = 0;

  // ── Epic 1: New Route Launch (SkyAir × Tokyo) ─────────────
  const epic1 = make(root, {
    type: 'epic', title: 'Launch SFO–NRT Route',
    status: 'in-progress', priority: 'critical',
    tags: ['routes', 'international'],
  });
  created++;

  const t1 = make(root, {
    type: 'task', title: 'Submit route approval to FAA and JCAB',
    status: 'done', priority: 'critical', parent: epic1,
    tags: ['compliance', 'international'],
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Prepare bilateral air service agreement documents',
    status: 'done', priority: 'high', parent: t1,
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Coordinate slot allocation at Narita Airport',
    status: 'done', priority: 'high', parent: t1,
  });
  created++;

  const t2 = make(root, {
    type: 'task', title: 'Assign Boeing 787-9 fleet for long-haul',
    status: 'in-progress', priority: 'high', parent: epic1,
    tags: ['fleet', 'operations'],
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Schedule pre-departure maintenance check',
    status: 'in-progress', priority: 'critical', parent: t2,
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Configure cabin for 14-hour flight (meals, IFE)',
    status: 'todo', priority: 'medium', parent: t2,
  });
  created++;

  make(root, {
    type: 'task', title: 'Hire and train Japan-route cabin crew',
    status: 'todo', priority: 'high', parent: epic1,
    tags: ['crew', 'training'],
  });
  created++;

  make(root, {
    type: 'task', title: 'Launch marketing campaign for SFO–NRT',
    status: 'backlog', priority: 'medium', parent: epic1,
    tags: ['marketing'],
  });
  created++;

  // ── Epic 2: Passenger Experience Upgrade ──────────────────
  const epic2 = make(root, {
    type: 'epic', title: 'Upgrade Passenger Experience',
    status: 'in-progress', priority: 'high',
    tags: ['passenger', 'experience'],
  });
  created++;

  const t3 = make(root, {
    type: 'task', title: 'Redesign business class seating',
    status: 'done', priority: 'high', parent: epic2,
    tags: ['cabin', 'design'],
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Source lie-flat seat suppliers',
    status: 'done', priority: 'high', parent: t3,
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Conduct passenger comfort testing',
    status: 'done', priority: 'medium', parent: t3,
  });
  created++;

  const t4 = make(root, {
    type: 'task', title: 'Roll out in-flight Wi-Fi on all A320s',
    status: 'in-progress', priority: 'high', parent: epic2,
    tags: ['connectivity', 'fleet'],
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Negotiate Starlink aviation contract',
    status: 'done', priority: 'critical', parent: t4,
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Install antenna hardware on 12 aircraft',
    status: 'in-progress', priority: 'high', parent: t4,
  });
  created++;

  make(root, {
    type: 'subtask', title: 'Test bandwidth at cruising altitude',
    status: 'todo', priority: 'medium', parent: t4,
  });
  created++;

  make(root, {
    type: 'task', title: 'Introduce premium meal service with local chefs',
    status: 'todo', priority: 'medium', parent: epic2,
    tags: ['catering', 'passenger'],
  });
  created++;

  make(root, {
    type: 'task', title: 'Refresh loyalty program tier benefits',
    status: 'backlog', priority: 'low', parent: epic2,
    tags: ['loyalty', 'passenger'],
  });
  created++;

  // ── Epic 3: Fleet Maintenance Overhaul ────────────────────
  const epic3 = make(root, {
    type: 'epic', title: 'Fleet Maintenance Overhaul Q3',
    status: 'todo', priority: 'critical',
    tags: ['maintenance', 'safety'],
  });
  created++;

  make(root, {
    type: 'task', title: 'Schedule D-check for N-471SK (A330)',
    status: 'todo', priority: 'critical', parent: epic3,
    tags: ['maintenance', 'heavy-check'],
  });
  created++;

  make(root, {
    type: 'task', title: 'Replace landing gear on three 737-800s',
    status: 'todo', priority: 'high', parent: epic3,
    tags: ['maintenance', 'safety'],
  });
  created++;

  make(root, {
    type: 'task', title: 'Engine borescope inspection — fleet-wide',
    status: 'backlog', priority: 'high', parent: epic3,
    tags: ['maintenance', 'engine'],
  });
  created++;

  make(root, {
    type: 'task', title: 'Update avionics software to Nav DB cycle 2406',
    status: 'cancelled', priority: 'medium', parent: epic3,
    tags: ['avionics'],
  });
  created++;

  // ── Bugs / Incidents ──────────────────────────────────────
  make(root, {
    type: 'bug', title: 'Check-in kiosk freezes at bag-drop confirmation screen',
    status: 'in-progress', priority: 'critical',
    tags: ['ground-ops', 'kiosk'],
  });
  created++;

  make(root, {
    type: 'bug', title: 'Boarding passes not scanning at gate B14',
    status: 'done', priority: 'critical',
    tags: ['ground-ops', 'gate'],
  });
  created++;

  make(root, {
    type: 'bug', title: 'IFE screens stuck on startup logo on rows 30–34',
    status: 'todo', priority: 'high', parent: epic2,
    tags: ['cabin', 'ife'],
  });
  created++;

  make(root, {
    type: 'bug', title: 'Meal preference not saved when booking via mobile app',
    status: 'backlog', priority: 'medium',
    tags: ['passenger', 'catering'],
  });
  created++;

  return { created };
}
