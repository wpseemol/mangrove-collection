/**
 * Builds the category icon library served by the API (`GET /v1/category-icons`).
 *
 *   node scripts/build-category-icons.mjs
 *
 * Reads Lucide's SVG drawing data from `dashboard/node_modules/lucide-react` and writes
 * `backend-api/resources/data/category-icons.json`. Only the elements in ALLOWED_TAGS and
 * attributes in ALLOWED_ATTRS are kept, so the clients can render icons without innerHTML.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const iconDir = join(root, 'dashboard/node_modules/lucide-react/dist/esm/icons')
const output = join(root, 'backend-api/resources/data/category-icons.json')

const MAX_ICONS = 350
const ALLOWED_TAGS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse'])
const ALLOWED_ATTRS = new Set(['d', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points'])

/** Group => icon names. An icon is listed under the first group it appears in. */
const GROUPS = {
  'Fish & Seafood': [
    'fish', 'fish-symbol', 'shrimp', 'shell', 'anchor', 'sailboat', 'ship', 'ship-wheel', 'waves', 'waves-horizontal',
    'droplet', 'droplets', 'turtle', 'snail', 'worm', 'fishing-hook', 'fishing-rod', 'thermometer-snowflake', 'snowflake', 'refrigerator',
  ],
  'Honey & Natural': [
    'hexagon', 'flower', 'flower-2', 'rose', 'leaf', 'leafy-green', 'sprout', 'clover', 'shrub', 'trees', 'tree-pine',
    'tree-deciduous', 'tree-palm', 'palmtree', 'plant-pot', 'feather', 'bird', 'sun', 'sunrise', 'mountain', 'mountain-snow',
    'amphora', 'vegan', 'earth', 'rainbow', 'cloud-sun', 'wind', 'bean', 'nut', 'wheat', 'hop',
  ],
  'Food & Grocery': [
    'apple', 'banana', 'carrot', 'cherry', 'citrus', 'grape', 'broccoli', 'salad', 'egg', 'egg-fried', 'beef', 'drumstick',
    'ham', 'croissant', 'sandwich', 'pizza', 'soup', 'cooking-pot', 'chef-hat', 'utensils', 'utensils-crossed', 'cookie',
    'candy', 'candy-cane', 'lollipop', 'cake', 'cake-slice', 'cupcake', 'dessert', 'donut', 'ice-cream-cone', 'ice-cream-bowl',
    'popcorn', 'popsicle', 'milk', 'coffee', 'cup-soda', 'beer', 'wine', 'glass-water', 'bottle-wine',
    'flame', 'carton', 'paper-bag', 'microwave', 'blender', 'store',
  ],
  'Shopping & Offers': [
    'shopping-bag', 'shopping-basket', 'shopping-cart', 'tag', 'tags', 'ticket-percent', 'badge-percent', 'percent', 'gift',
    'package', 'package-2', 'package-open', 'package-check', 'box', 'boxes', 'truck', 'warehouse', 'receipt', 'wallet',
    'credit-card', 'banknote', 'coins', 'bangladeshi-taka', 'hand-coins',
    'handshake', 'badge-check', 'award', 'medal', 'crown', 'gem', 'diamond', 'sparkles', 'star', 'heart',
  ],
  'Fashion & Accessories': [
    'shirt', 'glasses', 'watch', 'footprints', 'backpack', 'briefcase', 'umbrella', 'scissors', 'ribbon', 'sport-shoe',
    'venetian-mask', 'handbag', 'luggage', 'baggage-claim', 'spool', 'swatch-book', 'palette', 'hat-glasses',
  ],
  'Beauty & Personal Care': [
    'spray-can', 'brush', 'soap-dispenser-droplet', 'bath', 'shower-head', 'tube-lotion', 'toothbrush', 'toothbrush-sparkles',
    'smile', 'hand-heart', 'eye', 'sparkle', 'wand-sparkles', 'flask-conical', 'test-tube', 'pipette', 'towel-rack',
  ],
  'Health & Wellness': [
    'heart-pulse', 'pill', 'pill-bottle', 'tablets', 'stethoscope', 'syringe', 'thermometer', 'bandage', 'cross', 'activity',
    'hospital', 'brain', 'briefcase-medical', 'dna', 'microscope', 'scale', 'weight', 'hand-helping', 'shield-plus',
  ],
  'Home & Kitchen': [
    'house', 'home', 'sofa', 'armchair', 'bed', 'bed-double', 'lamp', 'lamp-desk',
    'lightbulb', 'washing-machine', 'fan', 'air-vent', 'heater', 'toilet', 'door-open', 'key', 'lock',
    'paint-roller', 'paint-bucket', 'paintbrush', 'broom', 'trash-2', 'shelving-unit', 'fence',
    'alarm-clock', 'clock', 'faucet',
  ],
  'Electronics & Gadgets': [
    'smartphone', 'tablet', 'laptop', 'monitor', 'tv', 'headphones', 'headset', 'speaker', 'camera', 'gamepad-2',
    'keyboard', 'mouse', 'printer', 'cpu', 'battery-charging', 'plug', 'plug-zap', 'wifi', 'router', 'radio',
    'usb', 'computer', 'zap',
  ],
  'Baby & Kids': [
    'baby', 'toy-brick', 'puzzle', 'blocks', 'balloon', 'shapes', 'party-popper', 'rocket', 'castle', 'school', 'dices',
    'ferris-wheel', 'roller-coaster', 'origami',
  ],
  'Sports & Outdoors': [
    'dumbbell', 'bike', 'trophy', 'volleyball', 'tent', 'tent-tree', 'compass', 'map', 'goal', 'timer', 'binoculars',
    'biceps-flexed', 'flag', 'target', 'person-standing', 'waves-ladder', 'parasol',
  ],
  'Pets & Animals': [
    'dog', 'cat', 'paw-print', 'bone', 'rabbit', 'rat', 'squirrel', 'panda', 'bug', 'egg-off', 'birdhouse',
  ],
  'Books & Stationery': [
    'book', 'book-open', 'book-heart', 'library', 'notebook', 'notebook-pen', 'pen', 'pen-tool', 'pencil', 'ruler',
    'graduation-cap', 'newspaper', 'scroll', 'sticky-note', 'paperclip', 'clipboard', 'highlighter', 'eraser', 'stamp',
    'calculator', 'music', 'guitar',
  ],
  'Tools & Garden': [
    'hammer', 'wrench', 'drill', 'axe', 'shovel', 'pickaxe', 'toolbox', 'tool-case', 'construction', 'tractor', 'nut-off',
    'bolt', 'cog', 'settings', 'pocket-knife', 'anvil', 'brick-wall', 'traffic-cone', 'flashlight', 'lightbulb-off',
    'magnet', 'cylinder', 'container', 'factory', 'recycle', 'solar-panel', 'droplet-off', 'sprout',
  ],
  'Automotive & Travel': [
    'car', 'car-front', 'car-taxi-front', 'bus', 'truck-electric', 'scooter', 'plane', 'train', 'tram-front', 'fuel',
    'map-pin', 'navigation', 'route', 'signpost', 'tickets-plane', 'car-battery', 'ev-charger', 'caravan', 'globe', 'milestone',
  ],
  'Everyday & General': [
    'layout-grid', 'layers', 'circle', 'square', 'triangle', 'infinity', 'bell', 'calendar', 'phone',
    'message-circle', 'moon', 'cloud', 'badge', 'shield-check', 'thumbs-up', 'heart-handshake',
  ],
}

/** Extra search words for icons whose names don't describe what a shop would use them for. */
const SYNONYMS = {
  fish: ['hilsa', 'ilish', 'seafood', 'fresh fish', 'river'],
  'fish-symbol': ['seafood', 'fish'],
  shrimp: ['prawn', 'golda', 'bagda', 'seafood', 'chingri'],
  shell: ['crab', 'oyster', 'mussel', 'seafood', 'shellfish'],
  hexagon: ['honey', 'honeycomb', 'bee', 'modhu'],
  droplet: ['honey', 'oil', 'ghee', 'liquid'],
  droplets: ['honey', 'oil', 'water'],
  amphora: ['jar', 'pot', 'honey', 'pickle', 'achar'],
  flower: ['honey', 'bee', 'organic'],
  'flower-2': ['honey', 'bee', 'organic'],
  leaf: ['organic', 'natural', 'herbal', 'tea'],
  'leafy-green': ['vegetables', 'sabji', 'greens'],
  sprout: ['organic', 'seeds', 'garden'],
  trees: ['sundarban', 'forest', 'mangrove'],
  'tree-palm': ['coconut', 'date'],
  palmtree: ['coconut', 'date', 'gur'],
  wheat: ['rice', 'grain', 'flour', 'atta', 'chal'],
  bean: ['lentils', 'dal', 'pulses', 'coffee'],
  nut: ['dry fruits', 'cashew', 'almond'],
  flame: ['spicy', 'chili', 'masala', 'hot'],
  'cooking-pot': ['cooking', 'curry', 'kitchen'],
  milk: ['dairy', 'ghee', 'doi', 'yogurt'],
  beef: ['meat', 'mutton'],
  drumstick: ['chicken', 'poultry', 'meat'],
  egg: ['eggs', 'duck egg', 'poultry'],
  'bangladeshi-taka': ['taka', 'price', 'offer', 'deal'],
  'ticket-percent': ['discount', 'coupon', 'sale', 'offer'],
  'badge-percent': ['discount', 'sale', 'offer'],
  gift: ['present', 'combo', 'hamper'],
  'shopping-basket': ['grocery', 'bazar', 'basket'],
  snowflake: ['frozen', 'cold storage'],
  'thermometer-snowflake': ['frozen', 'chilled'],
  refrigerator: ['frozen', 'chilled', 'fridge'],
  sun: ['dried', 'shutki', 'sun dried'],
  waves: ['river', 'sea', 'water', 'sundarban'],
  anchor: ['sea', 'marine', 'boat'],
  sailboat: ['boat', 'river', 'fishing'],
  'heart-pulse': ['health', 'fitness'],
  pill: ['medicine', 'supplement'],
  shirt: ['clothing', 'apparel', 'fashion'],
  'spray-can': ['perfume', 'attar', 'fragrance'],
  house: ['home', 'household'],
}

const label = (name) => name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())

const available = new Set(readdirSync(iconDir).filter((f) => f.endsWith('.mjs')).map((f) => f.slice(0, -4)))
const seen = new Set()
const missing = []
const icons = []

/** Alias files (e.g. `home`) only re-export another icon; follow them to the real name. */
const canonical = (name) => {
  const alias = readFileSync(join(iconDir, `${name}.mjs`), 'utf8').match(/export \{ default \} from '\.\/(.+)\.mjs'/)
  return alias ? alias[1] : name
}

for (const [group, listed] of Object.entries(GROUPS)) {
  for (const listedName of listed) {
    if (!available.has(listedName)) {
      missing.push(listedName)
      continue
    }
    const name = canonical(listedName)
    if (seen.has(name)) continue
    seen.add(name)

    const { __iconData } = await import(pathToFileURL(join(iconDir, `${name}.mjs`)).href)
    const nodes = __iconData.node.map(([tag, attrs]) => {
      if (!ALLOWED_TAGS.has(tag)) throw new Error(`${name}: unexpected <${tag}>`)
      return [tag, Object.fromEntries(Object.entries(attrs).filter(([key]) => ALLOWED_ATTRS.has(key)))]
    })

    const words = new Set([
      ...`${listedName}-${name}`.split('-').filter((w) => !/^\d+$/.test(w)),
      ...group.toLowerCase().split(/\s*&\s*|\s+/),
      ...(SYNONYMS[listedName] ?? []),
      ...(SYNONYMS[name] ?? []),
    ])
    icons.push({ name, label: label(name), group, keywords: [...words], nodes })
  }
}

if (icons.length > MAX_ICONS) {
  console.log(`Trimmed ${icons.length - MAX_ICONS} icons from the end to stay at ${MAX_ICONS}.`)
  icons.length = MAX_ICONS
}

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, JSON.stringify(icons) + '\n')

console.log(`Wrote ${icons.length} icons to ${output}`)
if (missing.length) console.log(`Skipped ${missing.length} names not in this lucide version: ${missing.join(', ')}`)
