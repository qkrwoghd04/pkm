#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import process from "node:process"
import matter from "gray-matter"

const repositoryRoot = process.cwd()
const contentRoot = path.join(repositoryRoot, "content")
const ignoredDirectories = new Set([".obsidian", "private", "templates"])
const requiredFields = ["id", "title", "description", "status", "updated", "tags"]
const allowedStatuses = new Set(["active", "draft", "deprecated", "resolved"])
const stableIdPattern = /^[a-z0-9]+(?:[\/_-][a-z0-9]+)*$/
const allowedTagPattern = /^(?:domain|tech|concern)\/[a-z0-9]+(?:-[a-z0-9]+)*$/
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
  const normalized = decodeURIComponent(target)
    .replace(/^\/+/, "")
    .replace(/\.md$/i, "")
    .replace(/\/+$/, "")

  if (normalized === "index") return ""
  return normalized.replace(/\/index$/, "")
}

function isValidUpdated(value) {
  if (value instanceof Date) return !Number.isNaN(value.valueOf())
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value))
}

function asList(value) {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
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
  const rawSlug = relativePath.replace(/\.md$/i, "")
  const slug = rawSlug === "index" ? "" : rawSlug.replace(/\/index$/, "")

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
const noteIdentifiers = new Map()
const notesByRelativePath = new Map(notes.map((note) => [note.relativePath, note]))

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

  if (note.data.verified_at && !isValidUpdated(note.data.verified_at)) {
    errors.push(`${label}: verified_at must use YYYY-MM-DD`)
  }

  if (note.data.source_commit && !/^[a-f0-9]{7,64}$/i.test(String(note.data.source_commit))) {
    errors.push(`${label}: source_commit must be a 7-64 character hexadecimal Git hash`)
  }

  if (note.data.id && !stableIdPattern.test(String(note.data.id))) {
    errors.push(`${label}: id must be a stable lowercase identifier`)
  }

  const identifiers = [note.data.id, ...asList(note.data.id_aliases)].filter(Boolean).map(String)
  for (const identifier of identifiers) {
    if (!stableIdPattern.test(identifier)) {
      errors.push(`${label}: invalid note identifier "${identifier}"`)
      continue
    }

    const owner = noteIdentifiers.get(identifier)
    if (owner && owner !== label) {
      errors.push(`${label}: note identifier "${identifier}" is already owned by ${owner}`)
    } else {
      noteIdentifiers.set(identifier, label)
    }
  }

  if (note.data.id_aliases != null && !Array.isArray(note.data.id_aliases)) {
    errors.push(`${label}: id_aliases must be a list`)
  }

  const projectMatch = note.relativePath.match(/^projects\/([^/]+)\//)
  if (projectMatch && !note.data.project_id) {
    errors.push(`${label}: project notes must include project_id`)
  }

  if (note.data.tags) {
    if (!Array.isArray(note.data.tags) || note.data.tags.length === 0) {
      errors.push(`${label}: tags must be a non-empty list`)
    } else {
      if (note.data.tags.length > 6) errors.push(`${label}: tags must contain at most 6 values`)

      const seenTags = new Set()
      for (const tag of note.data.tags.map(String)) {
        if (!allowedTagPattern.test(tag)) {
          errors.push(`${label}: tag "${tag}" must use domain/, tech/, or concern/`)
        }
        if (seenTags.has(tag)) errors.push(`${label}: duplicate tag "${tag}"`)
        seenTags.add(tag)
      }
    }
  }

  const filename = path.posix.basename(note.relativePath)
  if (filename !== "index.md" && /^\d{2}[-_]/.test(filename)) {
    errors.push(`${label}: use a semantic filename without a numeric prefix`)
  }

  const markdown = withoutFencedCode(note.body)
  const headings = new Map()
  const markdownLines = markdown.split(/\r?\n/)

  for (const [index, line] of markdownLines.entries()) {
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

  if (path.posix.basename(note.relativePath) !== "index.md") {
    const relatedHeadingIndex = markdownLines.findIndex((line) =>
      /^##\s+(?:관련 문서|Related knowledge)\s*$/i.test(line.trim()),
    )

    if (relatedHeadingIndex === -1) {
      errors.push(`${label}: non-index notes must include a related knowledge section`)
    } else {
      const sectionLines = []
      for (let index = relatedHeadingIndex + 1; index < markdownLines.length; index += 1) {
        if (/^##\s+/.test(markdownLines[index])) break
        sectionLines.push(markdownLines[index])
      }

      const relatedLinks = [...sectionLines.join("\n").matchAll(/\[\[([^\]]+)\]\]/g)]
      if (relatedLinks.length === 0 || relatedLinks.length > 7) {
        errors.push(`${label}: related knowledge section must contain 1-7 wikilinks`)
      }
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

function resolveWikilink(note, link) {
  const rawTarget = link.split("|", 1)[0].split("#", 1)[0].trim()
  if (!rawTarget) return null

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

  for (const candidate of [...new Set(candidates)]) {
    if (slugs.has(candidate)) return candidate
    if (aliases.has(candidate)) return notesByRelativePath.get(aliases.get(candidate))?.slug ?? null
  }

  const basenameMatches = notes.filter(
    (candidate) => path.posix.basename(candidate.slug) === path.posix.basename(normalized),
  )
  return basenameMatches.length === 1 ? basenameMatches[0].slug : null
}

function wikilinksFor(note) {
  return [...withoutFencedCode(note.body).matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => match[1])
}

for (const note of notes) {
  for (const link of wikilinksFor(note)) {
    if (!resolveWikilink(note, link)) {
      errors.push(`${note.relativePath}: unresolved wikilink "[[${link}]]"`)
    }
  }
}

for (const note of notes) {
  if (path.posix.basename(note.relativePath) === "index.md") continue

  const indexPath = `${note.directory}/index.md`
  const topicIndex = notesByRelativePath.get(indexPath)
  if (!topicIndex) continue

  const indexedSlugs = new Set(
    wikilinksFor(topicIndex)
      .map((link) => resolveWikilink(topicIndex, link))
      .filter(Boolean),
  )

  if (!indexedSlugs.has(note.slug)) {
    errors.push(`${note.relativePath}: topic index ${indexPath} does not link to this note`)
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
