#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import matter from "gray-matter"

const repositoryRoot = process.cwd()
const contentRoot = path.join(repositoryRoot, "content")
const ignoredDirectories = new Set([".obsidian", "private", "templates"])
const requiredFields = ["title", "description", "status", "updated", "tags"]
const allowedStatuses = new Set(["active", "draft", "deprecated", "resolved"])
const forbiddenPublicPatterns = [
  ["internal Outline URL", /https?:\/\/outline\.buttersoft\.dev\b/i],
  ["internal Linear URL", /https?:\/\/linear\.app\/buttersoft\b/i],
  ["private-work visibility", /^\s*visibility:\s*private-work\s*$/im],
  ["internal classification", /^\s*classification:\s*internal\s*$/im],
  ["private archive reference", /\barchive:\/\/[^\s`)]+/i],
  ["internal issue key", /\b1QPL-\d+\b/i],
  ["redaction placeholder", /\[내부 링크 제거\]/],
  ["internal name alias", /\b[\p{Script=Hangul}]{2,}_[A-Za-z]{2,}\b/u],
  ["named internal review field", /^\s*[-*]\s*(?:담당|검토|리뷰어)\s*[·:]/im],
]
const errors = []

function toPosix(filePath) {
  return filePath.split(path.sep).join("/")
}

function walk(directory) {
  const files = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue

    const absolutePath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(absolutePath))
    else if (entry.name.endsWith(".md")) files.push(absolutePath)
  }

  return files
}

function withoutFencedCode(markdown) {
  let fence = null
  const lines = []

  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\s*(```+|~~~+)/)
    if (match) {
      const marker = match[1][0]
      fence = fence === marker ? null : (fence ?? marker)
      lines.push("")
      continue
    }

    lines.push(fence ? "" : line)
  }

  return lines.join("\n")
}

function normalizeHeading(heading) {
  return heading
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+#+\s*$/, "")
    .trim()
    .toLocaleLowerCase("ko-KR")
}

function normalizeLinkTarget(target) {
  return decodeURIComponent(target).replace(/^\/+/, "").replace(/\.md$/i, "").replace(/\/+$/, "")
}

function isValidUpdated(value) {
  if (value instanceof Date) return !Number.isNaN(value.valueOf())
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value))
}

if (!fs.existsSync(contentRoot)) {
  console.error("content validation failed: content/ does not exist")
  process.exit(1)
}

const markdownFiles = walk(contentRoot).sort()
const notes = markdownFiles.map((absolutePath) => {
  const source = fs.readFileSync(absolutePath, "utf8")
  const parsed = matter(source)
  const relativePath = toPosix(path.relative(contentRoot, absolutePath))
  const slug = relativePath.replace(/\.md$/i, "").replace(/\/index$/, "")

  return {
    absolutePath,
    relativePath,
    directory: path.posix.dirname(relativePath),
    slug,
    source,
    data: parsed.data,
    body: parsed.content,
  }
})

const slugs = new Set(notes.map((note) => note.slug))
const aliases = new Map()

for (const note of notes) {
  const label = note.relativePath

  for (const field of requiredFields) {
    if (note.data[field] == null || note.data[field] === "") {
      errors.push(`${label}: missing frontmatter field "${field}"`)
    }
  }

  if (note.data.description && String(note.data.description).trim().length < 20) {
    errors.push(`${label}: description must explain the note in at least 20 characters`)
  }

  if (note.data.status && !allowedStatuses.has(String(note.data.status))) {
    errors.push(`${label}: unsupported status "${note.data.status}"`)
  }

  if (note.data.updated && !isValidUpdated(note.data.updated)) {
    errors.push(`${label}: updated must use YYYY-MM-DD`)
  }

  if (note.data.tags && (!Array.isArray(note.data.tags) || note.data.tags.length === 0)) {
    errors.push(`${label}: tags must be a non-empty list`)
  }

  const filename = path.posix.basename(note.relativePath)
  if (filename !== "index.md" && /^\d{2}[-_]/.test(filename)) {
    errors.push(`${label}: use a semantic filename without a numeric prefix`)
  }

  const markdown = withoutFencedCode(note.body)
  const headings = new Map()

  for (const [index, line] of markdown.split(/\r?\n/).entries()) {
    if (/^#\s+/.test(line)) {
      errors.push(`${label}:${index + 1}: body H1 duplicates Quartz ArticleTitle`)
    }

    const heading = line.match(/^#{2,6}\s+(.+?)\s*$/)
    if (!heading) continue

    const normalized = normalizeHeading(heading[1])
    if (headings.has(normalized)) {
      errors.push(
        `${label}:${index + 1}: duplicate heading "${heading[1]}" (first at line ${headings.get(normalized)})`,
      )
    } else {
      headings.set(normalized, index + 1)
    }
  }

  for (const alias of note.data.aliases ?? []) {
    const normalized = normalizeLinkTarget(String(alias))
    const owner = aliases.get(normalized)
    if (owner && owner !== label) {
      errors.push(`${label}: alias "${alias}" is already owned by ${owner}`)
    } else {
      aliases.set(normalized, label)
    }
  }

  const secretPatterns = [
    ["private key", /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/],
    ["OpenAI-style API key", /\bsk-(?!FAKE|REDACTED|EXAMPLE)[A-Za-z0-9_-]{20,}\b/],
    ["Telegram bot token", /\b\d{8,12}:AA[A-Za-z0-9_-]{25,}\b/],
    ["Google OAuth client secret", /"client_secret"\s*:\s*"(?!REDACTED|EXAMPLE|\[)[^"]{12,}"/],
  ]

  for (const [name, pattern] of secretPatterns) {
    if (pattern.test(note.body)) errors.push(`${label}: possible ${name} found`)
  }

  for (const [name, pattern] of forbiddenPublicPatterns) {
    if (pattern.test(note.source)) errors.push(`${label}: ${name} is not allowed in public content`)
  }
}

for (const note of notes) {
  const markdown = withoutFencedCode(note.body)
  const wikilinks = markdown.matchAll(/\[\[([^\]]+)\]\]/g)

  for (const match of wikilinks) {
    const rawTarget = match[1].split("|", 1)[0].split("#", 1)[0].trim()
    if (!rawTarget) continue

    const normalized = normalizeLinkTarget(rawTarget)
    const candidates = []

    if (rawTarget.startsWith("/") || rawTarget.startsWith("./") || rawTarget.startsWith("../")) {
      candidates.push(
        normalizeLinkTarget(path.posix.normalize(path.posix.join(note.directory, rawTarget))),
      )
    } else {
      candidates.push(normalizeLinkTarget(path.posix.join(note.directory, rawTarget)))
      candidates.push(normalized)
    }

    const basenameMatches = notes.filter(
      (candidate) => path.posix.basename(candidate.slug) === path.posix.basename(normalized),
    )
    candidates.push(...basenameMatches.map((candidate) => candidate.slug))

    const resolved = candidates.some((candidate) => slugs.has(candidate) || aliases.has(candidate))

    if (!resolved) {
      errors.push(`${note.relativePath}: unresolved wikilink "[[${match[1]}]]"`)
    }
  }
}

const directories = new Set(notes.map((note) => note.directory))
for (const directory of directories) {
  const expectedIndex = directory === "." ? "index.md" : `${directory}/index.md`
  if (!notes.some((note) => note.relativePath === expectedIndex)) {
    errors.push(`${directory}: populated topic directory is missing index.md`)
  }
}

if (errors.length > 0) {
  console.error(`content validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`- ${error}`)
  process.exit(1)
}

console.log(`content validation passed (${notes.length} notes)`)
