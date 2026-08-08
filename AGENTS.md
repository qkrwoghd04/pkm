# PKM content contract

This repository contains the public, reviewed PKM published with Quartz.

## Source of truth and privacy

- `content/` is the canonical source for public knowledge.
- Private knowledge belongs outside this repository. Do not recreate `content/private/`.
- Never publish credentials, tokens, OAuth files, passwords, private keys, personal email addresses, private calendar details, chat IDs, account IDs, or real portfolio values.
- Never publish internal-only URLs, private issue-tracker links, named internal reviewers, customer records, or source exports unless their release was explicitly approved.
- Use neutral placeholders for environment-specific values.

## Information architecture

- `content/agents/`: one agent's purpose, architecture, behavior, configuration, testing, automation, and operations.
- `content/projects/`: project-specific context, requirements, decisions, incidents, and runbooks. Use `project_id` to connect notes for the same project.
- `content/patterns/`: reusable engineering knowledge proven useful beyond one project. Create this area only when a cross-project pattern exists.
- `content/systems/`: shared infrastructure used by more than one agent.
- `content/integrations/`: external services, APIs, and CLIs.
- `content/playbooks/`: repeatable procedures that a reader can follow.
- `content/decisions/`: accepted design decisions and their rationale. Create this area only when a public decision exists.
- `content/incidents/`: symptoms, impact, cause, resolution, and prevention for a concrete failure.

Put knowledge in the most reusable scope. Link to shared system or integration notes instead of copying their content into agent notes.

`project_kind` may distinguish work and personal projects for navigation, but it is taxonomy, not an access-control boundary. Only material safe for this public repository belongs in `content/projects/`.

## File and navigation rules

- Use semantic kebab-case filenames. Do not add numeric prefixes.
- Keep project topics flat by default. In `content/projects/<project>/`, use semantic prefixes such as `incident-`, `decision-`, and `runbook-` instead of creating a third directory depth. Add a child directory only when the flat list has become materially hard to navigate.
- Every populated topic directory has an `index.md` that acts as a map of content.
- An index summarizes the topic, recommends a reading path, and links to authoritative notes. It must not duplicate whole notes.
- One note should answer one primary question.
- When moving a published note, add its former public slug to `aliases` so Quartz emits a redirect.
- Give every note a stable lowercase `id` that describes its knowledge identity rather than its current file path. When changing an existing MCP identifier, preserve the former identifier in `id_aliases`.
- Prefer explicit wikilinks with readable labels.
- Every non-index note has a `## 관련 문서` or `## Related knowledge` section with a small set of meaningful links. Topic indexes must link back to their authoritative notes.

## Frontmatter

Every public Markdown file must include:

- `id`
- `title`
- `description`
- `status`
- `updated`
- `tags`

Use `aliases` when the topic has common alternate names or an old public slug.
Use `id_aliases` only for former MCP note identifiers; do not mix them with Quartz URL aliases.

Notes below `content/projects/<project>/` must also include `project_id`. The project index and all flat child notes use the same value.

Tags are a controlled cross-cutting vocabulary, not a duplicate of the folder hierarchy. Use one to six tags and only these namespaces:

- `domain/`: the problem or knowledge domain
- `tech/`: a concrete technology or platform
- `concern/`: a reusable engineering or professional concern

Do not add project, status, or document-type tags when `project_id`, `status`, or the path already expresses that information.

Allowed status values:

- `active`: current operational knowledge
- `draft`: incomplete and not ready to be relied on
- `deprecated`: retained only for historical compatibility; link to the replacement
- `resolved`: a closed incident with a documented resolution

`updated` records the date the public note was materially revised. Do not imply that commands were re-verified unless the note says so explicitly.

The following provenance fields are optional and must be added only when their values are known:

- `verified_at`: date on which the described behavior or procedure was actually re-verified
- `source_repo`: repository that supports the current statement
- `source_commit`: verified source commit, using a 7–64 character hexadecimal Git hash

## Body structure

- Quartz renders the frontmatter title with `ArticleTitle`; do not repeat it as a body H1.
- Begin body sections at `##`.
- Put a concise summary or current-state statement before detailed procedures.
- Separate current behavior from historical rationale and incident history.
- State uncertainty and unverified steps explicitly.
- Do not invent missing implementation facts.
- Use the templates in `templates/` when creating projects, incidents, decisions, runbooks, or reusable patterns.

## Changes and validation

- Preserve existing user-authored meaning while reorganizing.
- Update affected indexes and wikilinks in the same change.
- Run content validation, secret scanning, and a Quartz build before publishing.
- Use the repository's Node version from `.node-version`.
- A push to `main` is a public approval action because the server deploys it automatically. Never push without explicit user approval.
