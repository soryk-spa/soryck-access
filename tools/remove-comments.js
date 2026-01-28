const fs = require('fs')
const path = require('path')

// Process entire src tree
const TARGET_DIRS = ['src']

// File extensions to process
const FILE_EXT_REGEX = /\.(ts|tsx|js|jsx|css|scss|html|json|md|txt)$/i

// Create a backup root directory with timestamp
const BACKUP_ROOT = path.join('backups', 'remove-comments-' + Date.now())

function ensureBackupDir(filePath) {
  const rel = path.relative(process.cwd(), filePath)
  const dest = path.join(BACKUP_ROOT, rel)
  const dir = path.dirname(dest)
  fs.mkdirSync(dir, { recursive: true })
  return dest
}

function removeCommentsFromCode(code) {
  let out = ''
  let i = 0
  const len = code.length
  let inSingle = false
  let inDouble = false
  let inBacktick = false
  let escaped = false

  while (i < len) {
    const ch = code[i]

    // handle escapes inside strings/template
    if ((inSingle || inDouble || inBacktick) && ch === '\\' && !escaped) {
      // copy escape and next char (if any)
      out += ch
      escaped = true
      i++
      continue
    }

    if (escaped) {
      // copy the escaped char
      out += ch
      escaped = false
      i++
      continue
    }

    // toggle string/template states
    if (!inDouble && !inBacktick && ch === "'") {
      inSingle = !inSingle
      out += ch
      i++
      continue
    }
    if (!inSingle && !inBacktick && ch === '"') {
      inDouble = !inDouble
      out += ch
      i++
      continue
    }
    if (!inSingle && !inDouble && ch === '`') {
      inBacktick = !inBacktick
      out += ch
      i++
      continue
    }

    // If we're inside any string/template literal, copy char and continue
    if (inSingle || inDouble || inBacktick) {
      out += ch
      i++
      continue
    }

    // Line comment
    if (ch === '/' && code[i + 1] === '/') {
      // skip until newline (remove comment)
      i += 2
      while (i < len && code[i] !== '\n') i++
      // keep the newline if present
      if (i < len && code[i] === '\n') {
        out += '\n'
        i++
      }
      continue
    }

    // Block comment
    if (ch === '/' && code[i + 1] === '*') {
      i += 2
      while (i < len && !(code[i] === '*' && code[i + 1] === '/')) i++
      // consume '*/' if present
      if (i < len) i += 2
      continue
    }

    out += ch
    i++
  }

  return out
}

function processFile(filePath) {
  const abs = path.resolve(filePath)
  const src = fs.readFileSync(abs, 'utf8')
  const cleaned = removeCommentsFromCode(src)
  if (cleaned !== src) {
    // backup original
    const backupPath = ensureBackupDir(abs)
    fs.writeFileSync(backupPath, src, 'utf8')
    fs.writeFileSync(abs, cleaned, 'utf8')
    console.log('Edited:', filePath)
    return true
  }
  return false
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full)
    else if (e.isFile()) {
      if (FILE_EXT_REGEX.test(e.name)) {
        processFile(full)
      }
    }
  }
}

let edited = 0
for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    walk(dir)
  } else {
    console.warn('Skipping missing dir', dir)
  }
}

console.log('Backups saved to', BACKUP_ROOT)
console.log('Done')
