# nod

A task manager where each task is a markdown file. Works great with git and Claude Code.

![](images/board.png)

## Install

Requires [Bun](https://bun.sh).

```bash
npm install -g @onmyway133/nod
```

## How it works

Each task lives in its own `.md` file inside a `tasks/` folder:

```
tasks/
  epic-1-onboarding.md
  task-2-setup-database.md
  subtask-3-write-migrations.md
```

Tasks have a YAML header with fields like status, priority, and parent. The rest of the file is free-form markdown — description, notes, work log, anything you want.

Because tasks are plain files, you can commit them to git, review diffs, and read them in any editor.

## Quick start

```bash
cd my-project
nod init

nod create epic "Build auth system"
nod create task "Design database schema" --parent epic-1 --priority high
nod create subtask "Write migrations" --parent task-2
nod create bug "Fix token expiry" --parent task-2

nod available        # what to work on
nod tree epic-1      # visual overview
nod ui               # open Kanban board in browser
```

## Commands

### `nod init`
Set up a nod project in the current directory. Creates `.nod/` and `tasks/`.

### `nod create <type> <title>`
Create a task. Types: `epic`, `task`, `subtask`, `bug`.

```bash
nod create epic "Launch v2"
nod create task "Write tests" --parent epic-1 --priority high
nod create bug "Crash on logout" --parent task-3 --tags auth,crash
```

Options: `--parent <id>`, `--priority <p>`, `--tags <t1,t2>`

### `nod list`
List tasks with optional filters.

```bash
nod list
nod list --status todo
nod list --priority high
nod list --type task --parent epic-1
nod list --json
```

### `nod available`
Show tasks ready to work on (`todo` or `in-progress`), sorted by priority.

```bash
nod available
nod available --json
```

### `nod get <id>`
Show a task's full content.

```bash
nod get task-2
nod get task-2 --json
```

### `nod update <id>`
Change task fields.

```bash
nod update task-2 --status in-progress
nod update task-2 --priority critical
nod update task-2 --title "New title"
nod update task-2 --tags backend,auth
```

### `nod note <id> <text>`
Append a timestamped note to the task's Work Log.

```bash
nod note task-2 "Decided to use UUIDs for user IDs"
```

### `nod subtasks <id>`
List direct children of a task.

```bash
nod subtasks task-2
nod subtasks task-2 --json
```

### `nod epic-tasks <id>`
List all tasks and subtasks inside an epic.

```bash
nod epic-tasks epic-1
nod epic-tasks epic-1 --json
```

### `nod tree <id>`
Show the task hierarchy as a tree.

```bash
nod tree epic-1
# epic-1 [in-progress] Build auth system
# └── task-2 [in-progress] Design database schema
#     └── subtask-3 [todo] Write migrations
```

### `nod open <id>`
Open the task file in `$EDITOR`.

```bash
nod open task-2
```

### `nod ui`
Open a Kanban board in the browser at `http://localhost:7777`. Reflects the current state of your `tasks/` folder and auto-refreshes every 3 seconds.

```bash
nod ui
nod ui --port 8080
```

## Task file format

```markdown
---
id: task-2
title: "Design database schema"
type: task
status: todo
priority: high
parent: epic-1
tags:
  - database
created: 2026-04-05
updated: 2026-04-05
---

# Design database schema

Decide on the tables and relationships.

## Notes

Looking at PostgreSQL with UUID primary keys.

## Work Log

- 2026-04-05: Started research
```

## Statuses

`todo` → `in-progress` → `done` · also: `blocked`, `cancelled`

## Priorities

`critical` · `high` · `medium` · `low`

## Using with Claude Code

```bash
nod available --json          # pick next task
nod get task-2 --json         # read full context
nod update task-2 --status in-progress
nod note task-2 "Changed X because Y"
nod update task-2 --status done
nod epic-tasks epic-1 --json  # check epic progress
```
