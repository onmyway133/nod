#!/usr/bin/env bun

import { Command } from 'commander';
import chalk from 'chalk';
import { NodError } from './utils/errors.ts';
declare const __VERSION__: string;
import { initCommand } from './commands/init.ts';
import { createCommand } from './commands/create.ts';
import { getCommand } from './commands/get.ts';
import { listCommand } from './commands/list.ts';
import { availableCommand } from './commands/available.ts';
import { backlogCommand } from './commands/backlog.ts';
import { updateCommand } from './commands/update.ts';
import { noteCommand } from './commands/note.ts';
import { subtasksCommand } from './commands/subtasks.ts';
import { epicTasksCommand } from './commands/epic-tasks.ts';
import { treeCommand } from './commands/tree.ts';
import { openCommand } from './commands/open.ts';
import { uiCommand } from './commands/ui.ts';

const program = new Command();

program
  .name('nod')
  .description('Markdown task manager for Claude Code')
  .version(__VERSION__);

program.addCommand(initCommand);
program.addCommand(createCommand);
program.addCommand(getCommand);
program.addCommand(listCommand);
program.addCommand(availableCommand);
program.addCommand(backlogCommand);
program.addCommand(updateCommand);
program.addCommand(noteCommand);
program.addCommand(subtasksCommand);
program.addCommand(epicTasksCommand);
program.addCommand(treeCommand);
program.addCommand(openCommand);
program.addCommand(uiCommand);

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err instanceof NodError) {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(err.exitCode);
  }
  throw err;
}
