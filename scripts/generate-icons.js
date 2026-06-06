#!/usr/bin/env node
/*
 * scripts/generate-icons.js
 * Generates placeholder SVG-based icons for the PWA.
 * Outputs to public/icons directory.
 */
const fs = require('fs')
const path = require('path')

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#080810"/>
  <text x="256" y="320" font-size="260" text-anchor="middle" fill="#d4a843">✈</text>
</svg>`

const outputDir = path.join(__dirname, '..', 'public', 'icons')
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

fs.writeFileSync(path.join(outputDir, 'icon.svg'), svgIcon)
console.log('✅ Placeholder SVG icon written to public/icons/icon.svg')
console.log('⚠️  Convert to PNG for production:')
console.log('   - icon-192.png (192×192px)')
console.log('   - icon-512.png (512×512px)')
console.log('   Use https://realfavicongenerator.net or any image editor')
