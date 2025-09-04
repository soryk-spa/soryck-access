const fs = require('fs')
const path = require('path')

// Folders to process
const TARGET_DIRS = ['src/app', 'src/components', 'src/hooks', 'src/lib']

// Directives to preserve inside comments (case-sensitive)
const PRESERVE_TOKENS = ['eslint', '@ts-ignore', '@ts-expect-error', 'istanbul', 'eslint-disable', 'eslint-enable', 'no-console']

function shouldPreserve(comment) {
  const lower = comment
  return PRESERVE_TOKENS.some(token => comment.includes(token))
}

function removeCommentsFromCode(code) {
  let out = ''
  let i = 0
  const len = code.length

  while (i < len) {
    const ch = code[i]

    // Line comment
    if (ch === '/' && code[i+1] === '/') {
      // capture full line comment
      const start = i
      i += 2
      let comment = ''
      while (i < len && code[i] !== '\n') {
        comment += code[i]
        i++
      }
      if (shouldPreserve('//' + comment)) {
        out += '//' + comment
      }
      // keep the newline if present
      if (i < len && code[i] === '\n') {
        out += '\n'
        i++
      }
      continue
    }

    // Block comment
    if (ch === '/' && code[i+1] === '*') {
      const start = i
      i += 2
      let comment = ''
      while (i < len && !(code[i] === '*' && code[i+1] === '/')) {
        comment += code[i]
        i++
      }
      // consume '*/'
      i += 2
      if (shouldPreserve('/*' + comment + '*/')) {
        out += '/*' + comment + '*/'
      }
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
      // process only .ts, .tsx, .js, .jsx, .css
      if (/\.(ts|tsx|js|jsx|css)$/.test(e.name)) {
        processFile(full)
      }
    }
  }
}

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) {
    walk(dir)
  } else {
    console.warn('Skipping missing dir', dir)
  }
}

console.log('Done')
