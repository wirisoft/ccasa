/**
 * This is an advanced example for creating icon bundles for Iconify SVG Framework.
 *
 * It creates a bundle from:
 * - All SVG files in a directory.
 * - Custom JSON files.
 * - Iconify icon sets.
 * - SVG framework.
 *
 * This example uses Iconify Tools to import and clean up icons.
 * For Iconify Tools documentation visit https://docs.iconify.design/tools/tools2/
 */
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'

// Installation: npm install --save-dev @iconify/tools @iconify/utils @iconify/json @iconify/iconify
import { cleanupSVG, importDirectory, isEmptyColor, parseColors, runSVGO } from '@iconify/tools'
import type { IconifyJSON } from '@iconify/types'
import { getIcons, getIconsCSS, stringToIcon } from '@iconify/utils'

/**
 * Script configuration
 */
interface BundleScriptCustomSVGConfig {
  // eslint-disable-next-line lines-around-comment
  // Path to SVG files
  dir: string

  // True if icons should be treated as monotone: colors replaced with currentColor
  monotone: boolean

  // Icon set prefix
  prefix: string
}

interface BundleScriptCustomJSONConfig {
  // eslint-disable-next-line lines-around-comment
  // Path to JSON file
  filename: string

  // List of icons to import. If missing, all icons will be imported
  icons?: string[]
}

interface BundleScriptConfig {
  // eslint-disable-next-line lines-around-comment
  // Custom SVG to import and bundle
  svg?: BundleScriptCustomSVGConfig[]

  // Icons to bundled from @iconify/json packages
  icons?: string[]

  // List of JSON files to bundled
  // Entry can be a string, pointing to filename or a BundleScriptCustomJSONConfig object (see type above)
  // If entry is a string or object without 'icons' property, an entire JSON file will be bundled
  json?: (string | BundleScriptCustomJSONConfig)[]
}

const sources: BundleScriptConfig = {
  json: [
    // Remix Icon: solo los usados en la app (sin prefijo ri-; el set es ri)
    {
      filename: require.resolve('@iconify/json/json/ri.json'),
      icons: [
        'add-line',
        'alarm-warning-line',
        'alert-fill',
        'alert-line',
        'arrow-down-s-line',
        'arrow-right-s-line',
        'arrow-up-s-line',
        'ball-pen-line',
        'behance-fill',
        'book-2-line',
        'brush-line',
        'check-double-line',
        'check-line',
        'checkbox-circle-line',
        'circle-line',
        'close-line',
        'computer-line',
        'database-2-line',
        'delete-bin-7-line',
        'delete-bin-line',
        'dribbble-fill',
        'drop-line',
        'edit-box-line',
        'error-warning-line',
        'eye-line',
        'eye-off-line',
        'facebook-fill',
        'file-list-3-line',
        'file-pdf-line',
        'filter-3-line',
        'fire-line',
        'flashlight-line',
        'flask-line',
        'focus-3-line',
        'github-fill',
        'google-fill',
        'group-line',
        'home-smile-line',
        'image-add-line',
        'image-line',
        'inbox-line',
        'information-line',
        'line-chart-line',
        'linkedin-fill',
        'links-line',
        'lock-line',
        'lock-unlock-line',
        'logout-box-r-line',
        'macbook-line',
        'mail-line',
        'menu-line',
        'message-2-line',
        'money-dollar-circle-line',
        'moon-clear-line',
        'more-2-line',
        'numbers-line',
        'pencil-line',
        'phone-fill',
        'pie-chart-2-line',
        'question-line',
        'quill-pen-line',
        'scales-3-line',
        'search-line',
        'settings-3-line',
        'share-line',
        'shield-check-line',
        'shield-user-line',
        'shopping-basket-line',
        'shopping-cart-2-line',
        'slack-fill',
        'stack-line',
        'star-fill',
        'star-line',
        'sun-line',
        'table-line',
        'team-line',
        'temp-hot-line',
        'test-tube-line',
        'thumb-up-fill',
        'tools-line',
        'twitter-fill',
        'upload-cloud-2-line',
        'user-3-line',
        'user-settings-line',
        'vip-crown-line',
        'file-pdf-2-line',
        'save-line',
        'send-plane-line'
      ]
    },

    // Custom file with only few icons
    {
      filename: require.resolve('@iconify/json/json/line-md.json'),
      icons: ['home-twotone-alt', 'github', 'document-list', 'document-code', 'image-twotone']
    }

    // Custom JSON file
    // 'json/gg.json'
  ],

  icons: [
    'bx-basket',
    'bi-airplane-engines',
    'tabler-anchor',
    'uit-adobe-alt',

    // 'fa6-regular-comment',
    'twemoji-auto-rickshaw'
  ],

  svg: [
    /* {
      dir: 'src/assets/iconify-icons/svg',
      monotone: false,
      prefix: 'custom'
    } */
    /* {
      dir: 'src/assets/iconify-icons/emojis',
      monotone: false,
      prefix: 'emoji'
    } */
  ]
}

// File to save bundle to
const target = join(__dirname, 'generated-icons.css')

/**
 * Do stuff!
 */

;(async function () {
  // Create directory for output if missing
  const dir = dirname(target)

  try {
    await fs.mkdir(dir, {
      recursive: true
    })
  } catch (err) {
    //
  }

  const allIcons: IconifyJSON[] = []

  /**
   * Convert sources.icons to sources.json
   */
  if (sources.icons) {
    const sourcesJSON = sources.json ? sources.json : (sources.json = [])

    // Sort icons by prefix
    const organizedList = organizeIconsList(sources.icons)

    for (const prefix in organizedList) {
      const filename = require.resolve(`@iconify/json/json/${prefix}.json`)

      sourcesJSON.push({
        filename,
        icons: organizedList[prefix]
      })
    }
  }

  /**
   * Bundle JSON files and collect icons
   */
  if (sources.json) {
    for (let i = 0; i < sources.json.length; i++) {
      const item = sources.json[i]

      // Load icon set
      const filename = typeof item === 'string' ? item : item.filename
      const content = JSON.parse(await fs.readFile(filename, 'utf8')) as IconifyJSON

      // Filter icons
      if (typeof item !== 'string' && item.icons?.length) {
        const filteredContent = getIcons(content, item.icons)

        if (!filteredContent) throw new Error(`Cannot find required icons in ${filename}`)

        // Collect filtered icons
        allIcons.push(filteredContent)
      } else {
        // Collect all icons from the JSON file
        allIcons.push(content)
      }
    }
  }

  /**
   * Bundle custom SVG icons and collect icons
   */
  if (sources.svg) {
    for (let i = 0; i < sources.svg.length; i++) {
      const source = sources.svg[i]

      // Import icons
      const iconSet = await importDirectory(source.dir, {
        prefix: source.prefix
      })

      // Validate, clean up, fix palette, etc.
      await iconSet.forEach(async (name, type) => {
        if (type !== 'icon') return

        // Get SVG instance for parsing
        const svg = iconSet.toSVG(name)

        if (!svg) {
          // Invalid icon
          iconSet.remove(name)

          return
        }

        // Clean up and optimise icons
        try {
          // Clean up icon code
          await cleanupSVG(svg)

          if (source.monotone) {
            // Replace color with currentColor, add if missing
            // If icon is not monotone, remove this code
            await parseColors(svg, {
              defaultColor: 'currentColor',
              callback: (attr, colorStr, color) => {
                return !color || isEmptyColor(color) ? colorStr : 'currentColor'
              }
            })
          }

          // Optimise
          await runSVGO(svg)
        } catch (err) {
          // Invalid icon
          console.error(`Error parsing ${name} from ${source.dir}:`, err)
          iconSet.remove(name)

          return
        }

        // Update icon from SVG instance
        iconSet.fromSVG(name, svg)
      })

      // Collect the SVG icon
      allIcons.push(iconSet.export())
    }
  }

  // Generate CSS from collected icons
  const cssContent = allIcons
    .map(iconSet => getIconsCSS(iconSet, Object.keys(iconSet.icons), { iconSelector: '.{prefix}-{name}' }))
    .join('\n')

  // Save the CSS to a file
  await fs.writeFile(target, cssContent, 'utf8')

  console.log(`Saved CSS to ${target}!`)
})().catch(err => {
  console.error(err)
})

/**
 * Sort icon names by prefix
 */
function organizeIconsList(icons: string[]): Record<string, string[]> {
  const sorted: Record<string, string[]> = Object.create(null)

  icons.forEach(icon => {
    const item = stringToIcon(icon)

    if (!item) return

    const prefix = item.prefix
    const prefixList = sorted[prefix] ? sorted[prefix] : (sorted[prefix] = [])

    const name = item.name

    if (!prefixList.includes(name)) prefixList.push(name)
  })

  return sorted
}
