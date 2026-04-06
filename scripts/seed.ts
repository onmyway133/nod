#!/usr/bin/env bun
/**
 * Seed script: generates demo tasks for visual testing of the nod dashboard.
 * Run from your project root: bun run scripts/seed.ts
 */

import { findNodRoot } from '../src/core/id.ts';
import { seedDemoData } from '../src/core/seed.ts';

const root = findNodRoot(process.cwd());
const { created } = seedDemoData(root);
console.log(`✓ Created ${created} demo tasks in ${root}/tasks/`);
