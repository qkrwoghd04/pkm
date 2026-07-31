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
- Every populated topic directory has an `index.md` that acts as a map of content.
- An index summarizes the topic, recommends a reading path, and links to authoritative notes. It must not duplicate whole notes.
- One note should answer one primary question.
- When moving a published note, add its former public slug to `aliases` so Quartz emits a redirect.
- Prefer explicit wikilinks with readable labels.

## Frontmatter

Every public Markdown file must include:

- `title`
- `description`
- `status`
- `updated`
- `tags`

Use `aliases` when the topic has common alternate names or an old public slug.

Allowed status values:

- `active`: current operational knowledge
- `draft`: incomplete and not ready to be relied on
- `deprecated`: retained only for historical compatibility; link to the replacement
- `resolved`: a closed incident with a documented resolution

`updated` records the date the public note was materially revised. Do not imply that commands were re-verified unless the note says so explicitly.

## Body structure

- Quartz renders the frontmatter title with `ArticleTitle`; do not repeat it as a body H1.
- Begin body sections at `##`.
- Put a concise summary or current-state statement before detailed procedures.
- Separate current behavior from historical rationale and incident history.
- State uncertainty and unverified steps explicitly.
- Do not invent missing implementation facts.

## Changes and validation

- Preserve existing user-authored meaning while reorganizing.
- Update affected indexes and wikilinks in the same change.
- Run content validation, secret scanning, and a Quartz build before publishing.
- Use the repository's Node version from `.node-version`.
- A push to `main` is a public approval action because the server deploys it automatically. Never push without explicit user approval.
