/**
 * Starter blog: 5 categories and 15 SEO-focused articles about Sundarban honey, sea fish, crab and prawn
 * (`pnpm db:seed:blog`). Each post has its own cover in `prisma/seed-images/blog/<slug>.jpg`.
 * Idempotent: categories are upserted by slug and posts whose slug already exists are skipped.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { paths } from '../src/lib/paths.js'
import { prisma } from '../src/lib/prisma.js'
import { storage } from '../src/lib/storage.js'
import { randomLower } from '../src/lib/str.js'

/** Open Graph size, so shared links get a full-width preview. */
const COVER = { width: 1200, height: 630 }

const CATEGORIES = [
  {
    slug: 'honey-health-benefits',
    name: 'Honey & Health',
    icon: 'droplet',
    description: 'Science-backed guides to the health benefits of raw Sundarban honey, how to use it every day and how to tell pure honey from fake.',
  },
  {
    slug: 'sea-fish-guide',
    name: 'Sea Fish Guide',
    icon: 'fish',
    description: 'How to choose fresh hilsa, pomfret, bhetki, mud crab and golda prawn, with nutrition facts, best seasons and buying tips.',
  },
  {
    slug: 'healthy-recipes',
    name: 'Healthy Recipes',
    icon: 'chef-hat',
    description: 'Easy Bangladeshi recipes with natural honey, fresh fish and prawn, from shorshe ilish to chingri malai curry.',
  },
  {
    slug: 'sundarbans-stories',
    name: 'Sundarbans Stories',
    icon: 'trees',
    description: 'Stories from the world’s largest mangrove forest: Moual honey hunters, fishing families and the honey of every season.',
  },
  {
    slug: 'buying-storage-guide',
    name: 'Buying & Storage Guide',
    icon: 'package-check',
    description: 'Practical tips on buying natural food online in Bangladesh, storing honey and freezing fish the right way.',
  },
] as const

type CategorySlug = (typeof CATEGORIES)[number]['slug']

type SeedPost = {
  category: CategorySlug
  slug: string
  title: string
  excerpt: string
  tags: string[]
  featured?: boolean
  meta_title: string
  meta_description: string
  content: string
}

const post = (slug: string, text: string) => `<a href="/blog/${slug}/">${text}</a>`
const shop = (text = 'Shop our natural honey and fresh seafood') => `<p><strong>Ready to taste the difference?</strong> <a href="/shop/">${text}</a>, sourced directly from the Sundarbans and delivered across Bangladesh.</p>`
const faq = (items: [string, string][]) => `<h2>Frequently asked questions</h2>${items.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join('')}`

const POSTS: SeedPost[] = [
  /* ------------------------------------------------------------------ Honey & Health */
  {
    category: 'honey-health-benefits',
    slug: 'health-benefits-of-raw-sundarban-honey',
    title: '10 Proven Health Benefits of Raw Sundarban Honey',
    excerpt: 'Raw Sundarban honey is more than a sweetener. Discover ten science-backed benefits, from a stronger immune system to better sleep and healthier skin.',
    tags: ['sundarban honey', 'raw honey', 'honey benefits', 'natural remedies'],
    featured: true,
    meta_title: '10 Health Benefits of Raw Sundarban Honey (Science-Backed)',
    meta_description: 'Discover 10 proven health benefits of raw Sundarban mangrove honey: immunity, digestion, energy, sleep, cough relief and skin care, plus how much to eat.',
    content: `<p>Raw honey from the Sundarban mangrove forest is made by wild giant rock bees that feed on Khalisha, Goran and Keora blossoms. Because it is never heated or ultra-filtered, it keeps the natural enzymes, antioxidants and pollen that processed supermarket honey loses. Here are ten reasons to make a spoonful part of your daily routine.</p>
<h2>1. Rich in natural antioxidants</h2><p>Raw honey contains flavonoids and phenolic acids that help the body fight oxidative stress, a cause of early ageing and many chronic diseases. Darker varieties such as Goran honey usually have the highest antioxidant levels. Learn more in our guide to ${post('types-of-sundarban-honey', 'the types of Sundarban honey')}.</p>
<h2>2. Supports a healthy immune system</h2><p>Warm water with honey and lemon in the morning is a traditional Bangladeshi remedy for good reason. Honey's mild antibacterial properties and antioxidants support the body during seasonal changes.</p>
<h2>3. Soothes cough and sore throat</h2><p>Research shows honey can calm a night-time cough as effectively as many over-the-counter syrups. Take one teaspoon before bed, or try our ${post('honey-lemon-ginger-tea-recipe', 'honey lemon ginger tea')}. Never give honey to babies under one year old.</p>
<h2>4. A natural energy booster</h2><p>Honey is a mix of glucose and fructose, giving both quick and lasting energy. That is why many athletes and students take a spoonful before exercise or exams.</p>
<h2>5. Helps digestion and gut health</h2><p>Raw honey works as a prebiotic, feeding the good bacteria in your gut. A teaspoon in lukewarm water can ease mild indigestion.</p>
<h2>6. Promotes better sleep</h2><p>A little honey in warm milk helps the brain release melatonin, the hormone that controls sleep.</p>
<h2>7. Heals minor wounds and burns</h2><p>Honey has been used on wounds for centuries thanks to its antibacterial and moisturising effect. Medical-grade honey is still used in hospitals today.</p>
<h2>8. Keeps skin soft and clear</h2><p>Use raw honey as a ten-minute face mask, alone or with a few drops of lemon, to clean pores and lock in moisture.</p>
<h2>9. A smarter swap for white sugar</h2><p>Honey is sweeter than sugar, so you need less, and it brings minerals and antioxidants that sugar lacks. See the full comparison in ${post('honey-vs-sugar-which-is-healthier', 'honey vs sugar')}.</p>
<h2>10. Supports heart health</h2><p>As part of a balanced diet, the antioxidants in honey may help maintain healthy blood pressure and cholesterol levels.</p>
<h2>How much honey should you eat per day?</h2><p>One to two tablespoons a day is enough for most healthy adults. Choose raw, unprocessed honey from a trusted source, because adulterated honey gives none of these benefits. Not sure about yours? Try our ${post('how-to-identify-pure-honey-at-home', '7 home tests for pure honey')}.</p>
${faq([
  ['Is Sundarban honey good for health?', 'Yes. Raw Sundarban honey is rich in antioxidants, enzymes and minerals, and is traditionally used for immunity, cough relief, digestion and energy.'],
  ['Can diabetic patients eat honey?', 'Honey still raises blood sugar, so people with diabetes should speak to their doctor before adding it to their diet.'],
  ['When is the best time to eat honey?', 'Many people take it in the morning with warm water and lemon, or at night in warm milk to help sleep.'],
])}
${shop('Buy raw Sundarban honey')}`,
  },
  {
    category: 'honey-health-benefits',
    slug: 'how-to-identify-pure-honey-at-home',
    title: 'How to Identify Pure Honey at Home: 7 Simple Tests',
    excerpt: 'Fake and adulterated honey is common in Bangladesh. Use these seven easy home tests to check whether your honey is pure before you buy again.',
    tags: ['pure honey', 'fake honey', 'honey test', 'buying guide'],
    featured: true,
    meta_title: 'How to Check Pure Honey at Home: 7 Easy Tests',
    meta_description: 'Is your honey real? Try these 7 simple home tests (water, thumb, paper, flame, vinegar, crystallisation, taste) to spot fake or adulterated honey quickly.',
    content: `<p>Honey mixed with sugar syrup, jaggery or starch is sold widely in Bangladeshi markets and online. The good news is that you can spot most fake honey with things already in your kitchen.</p>
<h2>1. The water test</h2><p>Drop a spoonful of honey into a glass of room-temperature water. Pure honey sinks and settles at the bottom as a lump. Adulterated honey starts dissolving immediately.</p>
<h2>2. The thumb test</h2><p>Put a small drop on your thumb. Pure honey is thick and stays in place. Diluted honey spreads and runs off.</p>
<h2>3. The paper test</h2><p>Drop honey on blotting paper or a paper towel. Real honey does not soak through quickly, while honey with added water leaves a wet ring.</p>
<h2>4. The flame test</h2><p>Dip the tip of a dry matchstick in honey and strike it. Pure honey contains very little moisture, so the match still lights. Honey with added water stops it burning.</p>
<h2>5. The vinegar test</h2><p>Mix a spoon of honey with water and two or three drops of vinegar. If it foams, the honey may contain chalk or plaster.</p>
<h2>6. Crystallisation</h2><p>Natural honey crystallises in cold weather. Many people think this means it has spoiled, but it is actually a strong sign of purity. Read ${post('why-honey-crystallizes', 'why honey crystallises and how to fix it')}.</p>
<h2>7. Taste and smell</h2><p>Real Sundarban honey has a floral aroma and a slightly warm, tangy aftertaste. Fake honey tastes only of plain sugar and has almost no smell.</p>
<h2>The most reliable test: know your source</h2><p>Home tests are helpful but not laboratory-accurate. The safest option is buying from people who know exactly where the honey comes from. Every batch at Mangrove Collection comes directly from ${post('moual-honey-hunters-of-the-sundarbans', 'Moual honey hunters')} in the Sundarbans.</p>
${faq([
  ['Does pure honey freeze in the fridge?', 'Pure honey does not freeze solid, but it thickens and may crystallise faster when cold.'],
  ['Is crystallised honey fake?', 'No. Crystallisation is a natural process and is common in raw, unprocessed honey.'],
  ['Can pure honey be runny?', 'Yes. Freshly harvested honey and varieties high in fructose stay runny for months.'],
])}
${shop('Buy 100% pure Sundarban honey')}`,
  },
  {
    category: 'honey-health-benefits',
    slug: 'honey-vs-sugar-which-is-healthier',
    title: 'Honey vs Sugar: Which Is Healthier for Your Family?',
    excerpt: 'Both are sweet, but honey and sugar act very differently in the body. A clear comparison of calories, glycemic index and nutrition, plus how to switch.',
    tags: ['honey vs sugar', 'healthy eating', 'nutrition', 'raw honey'],
    meta_title: 'Honey vs Sugar: Calories, Glycemic Index and Health',
    meta_description: 'Honey or sugar, which is healthier? Compare calories, glycemic index, vitamins and minerals, and learn how to replace sugar with honey in tea and cooking.',
    content: `<p>Swapping white sugar for natural honey is one of the easiest diet changes a family can make. But is honey really better? Here is an honest comparison.</p>
<h2>Calories</h2><p>One teaspoon of honey has about 21 calories, while a teaspoon of sugar has about 16. However, honey tastes sweeter, so most people naturally use less.</p>
<h2>Glycemic index</h2><p>Honey has a glycemic index of around 50 to 58, lower than table sugar at about 65. That means a slower, gentler rise in blood sugar.</p>
<h2>Nutrients</h2><ul><li><strong>White sugar:</strong> pure sucrose with no vitamins, minerals or antioxidants.</li><li><strong>Raw honey:</strong> small amounts of vitamin C, B vitamins, potassium, calcium, iron, enzymes and antioxidants.</li></ul>
<h2>Digestion</h2><p>Honey's natural enzymes make it easier to digest, and it acts as a prebiotic for gut health. Sugar offers no such benefit.</p>
<h2>How to switch from sugar to honey</h2><ul><li>Use three-quarters of a cup of honey for every cup of sugar in recipes, and reduce other liquids slightly.</li><li>Add honey to tea once it has cooled a little to protect its enzymes.</li><li>Start with breakfast: honey on toast, in yoghurt, oats or a morning ${post('honey-lemon-ginger-tea-recipe', 'honey lemon ginger tea')}.</li></ul>
<h2>The verdict</h2><p>Honey is still a natural sugar, so moderation matters. But raw, unprocessed honey gives you flavour, nutrients and ${post('health-benefits-of-raw-sundarban-honey', 'real health benefits')} that white sugar simply cannot.</p>
${faq([
  ['Is honey better than sugar for weight loss?', 'Honey can help because you need less of it, but total calories still matter. Use it in small amounts.'],
  ['Can I bake with honey instead of sugar?', 'Yes. Use about 25% less honey than sugar and lower the oven temperature by around 15°C to prevent over-browning.'],
])}
${shop('Switch to raw Sundarban honey')}`,
  },

  /* ------------------------------------------------------------------ Fish & Seafood Guide */
  {
    category: 'sea-fish-guide',
    slug: 'how-to-choose-fresh-sea-fish',
    title: 'How to Choose Fresh Sea Fish: 6 Signs of Freshness',
    excerpt: 'Eyes, gills, smell and texture tell you everything. Learn how to pick the freshest sea fish every time, at the market or when ordering online.',
    tags: ['fresh fish', 'sea fish', 'buying guide', 'formalin free'],
    featured: true,
    meta_title: 'How to Choose Fresh Sea Fish: 6 Signs of Freshness',
    meta_description: 'Learn the 6 signs of fresh sea fish: clear eyes, red gills, firm flesh, shiny skin, clean sea smell and no formalin. Buy the freshest fish every time.',
    content: `<p>Fresh fish tastes sweet, cooks evenly and is safer to eat. These are the signs experienced buyers in Khulna and Chattogram fish markets look for.</p>
<h2>1. Clear, bulging eyes</h2><p>Fresh fish has bright, clear and slightly bulging eyes. Cloudy, grey or sunken eyes mean the fish is old.</p>
<h2>2. Bright red gills</h2><p>Lift the gill cover. It should be bright red or pink and moist, never brown, grey or slimy.</p>
<h2>3. Firm, springy flesh</h2><p>Press the body gently with a finger. Fresh flesh springs back immediately. Old fish leaves a dent.</p>
<h2>4. Shiny skin and tight scales</h2><p>The skin should look wet and metallic, with scales firmly attached.</p>
<h2>5. A clean smell of the sea</h2><p>Fresh sea fish smells mild, like seawater. A strong fishy or ammonia smell is a warning sign.</p>
<h2>6. No formalin</h2><p>Fish treated with formalin often looks unnaturally stiff, the eyes stay oddly bright for days, and flies avoid it. Always buy from sellers who guarantee formalin-free fish.</p>
<h2>Buying fish online</h2><p>Choose a seller that packs fish on ice on the day of the catch and delivers in insulated boxes. Once it arrives, follow our guide on ${post('how-to-store-and-freeze-fish', 'how to store and freeze fish')} to keep it fresh for months.</p>
<p>Want to go deeper? Read our guides to ${post('hilsa-ilish-nutrition-and-season', 'buying hilsa')} and ${post('mud-crab-and-golda-prawn-buying-guide', 'choosing mud crab and golda prawn')}.</p>
${faq([
  ['How can I tell if fish has formalin?', 'Formalin fish is often stiff, has a chemical smell instead of a sea smell, and does not attract flies. Buying from a trusted direct source is the safest option.'],
  ['How long does fresh fish last in the fridge?', 'Only one to two days. Freeze it if you won’t cook it by then.'],
])}
${shop('Order fresh, formalin-free fish')}`,
  },
  {
    category: 'sea-fish-guide',
    slug: 'hilsa-ilish-nutrition-and-season',
    title: 'Hilsa (Ilish) Fish: Nutrition, Best Season and Buying Tips',
    excerpt: 'Bangladesh’s national fish is rich in omega-3. Find out when hilsa tastes best, how to recognise top-quality ilish and how to store it.',
    tags: ['hilsa', 'ilish', 'omega-3', 'national fish'],
    meta_title: 'Hilsa Fish (Ilish): Nutrition, Season and Buying Tips',
    meta_description: 'Everything about hilsa (ilish): omega-3 nutrition, the best months to buy, how to identify Padma and Meghna hilsa, fishing bans and storage tips.',
    content: `<p>Hilsa, or ilish, is more than a fish in Bangladesh. It is a celebration. Its rich, oily flesh is loved in ${post('shorshe-ilish-recipe', 'shorshe ilish')}, bhapa ilish and crispy fry.</p>
<h2>Hilsa nutrition</h2><ul><li>One of the richest natural sources of omega-3 fatty acids, for heart and brain health</li><li>High-quality protein</li><li>Rich in vitamin D, vitamin A, calcium, iron and selenium</li></ul>
<h2>When is hilsa season?</h2><p>Hilsa is at its best during the monsoon, from July to October, when it swims from the Bay of Bengal into the rivers to spawn. To protect breeding, fishing is banned for 22 days around the October full moon, and catching jatka (young hilsa) is banned from November to June.</p>
<h2>How to recognise top-quality hilsa</h2><ul><li>Bright silver body with a slight pink tint</li><li>Broad, thick back, a sign of high fat content</li><li>Small head compared to the body</li><li>Fish of 1 kg or more have the richest taste</li><li>River hilsa from the Padma and Meghna is slimmer and sweeter than sea hilsa</li></ul>
<h2>How to store hilsa</h2><p>Clean the fish, cut into pieces, pat completely dry and freeze in airtight bags. Hilsa keeps its flavour for about three months. See our full ${post('how-to-store-and-freeze-fish', 'fish freezing guide')}.</p>
${faq([
  ['Which is better, river hilsa or sea hilsa?', 'River hilsa from the Padma and Meghna is usually considered tastier and richer, while sea hilsa is more widely available and more affordable.'],
  ['Is hilsa good for health?', 'Yes. Hilsa is packed with omega-3, protein and vitamin D. Steaming or light curries keep the most nutrients.'],
])}
${shop('Buy fresh hilsa online')}`,
  },
  {
    category: 'sea-fish-guide',
    slug: 'mud-crab-and-golda-prawn-buying-guide',
    title: 'Sundarban Mud Crab and Golda Prawn: A Complete Buying Guide',
    excerpt: 'How to choose live mud crab and giant golda prawn, what to pay attention to, the best seasons and how to clean and cook them at home.',
    tags: ['mud crab', 'golda prawn', 'chingri', 'seafood'],
    meta_title: 'Mud Crab and Golda Prawn Buying Guide (Sundarban)',
    meta_description: 'How to choose fresh Sundarban mud crab and golda prawn: signs of quality, best season, male vs female crab, cleaning tips and easy ways to cook them.',
    content: `<p>The rivers and mangroves of the Sundarbans produce two of Bangladesh’s most prized seafoods: the mud crab (shila kakra) and the giant freshwater golda prawn (golda chingri). Here is how to buy the best.</p>
<h2>Choosing mud crab</h2><ul><li><strong>Buy live:</strong> a fresh crab moves its legs and claws actively. Never buy a dead crab, because it spoils within hours.</li><li><strong>Heavy for its size:</strong> a heavy crab is full of meat. A light crab has recently moulted and is mostly water.</li><li><strong>Hard shell:</strong> press the underside. It should feel firm, not soft.</li><li><strong>Male or female:</strong> males (narrow flap underneath) have bigger claws and more meat; females (wide, round flap) may carry rich orange roe.</li></ul>
<h2>Choosing golda prawn</h2><ul><li>Firm, translucent body with a blue-grey tint and long, intact claws</li><li>Head firmly attached; a black or loose head means the prawn is old</li><li>Fresh, mild smell with no ammonia</li><li>Larger prawns (8 to 12 per kg) are ideal for malai curry and grilling</li></ul>
<h2>Best season</h2><p>Mud crab is available all year, but is fullest from September to February. Golda prawn is at its best after the monsoon, from August to December.</p>
<h2>Cleaning and cooking</h2><p>Chill live crabs in the freezer for 20 minutes before cleaning; it calms them and makes handling safer. For prawns, keep the head on for curries for extra flavour, and remove the dark vein along the back. Try our ${post('golda-chingri-malai-curry-recipe', 'golda chingri malai curry')} for a classic dish.</p>
<p>For fish, read ${post('how-to-choose-fresh-sea-fish', 'the 6 signs of fresh sea fish')}.</p>
${faq([
  ['How long can live mud crabs survive?', 'Kept cool and moist under a damp cloth, mud crabs can stay alive for two to three days.'],
  ['Can I freeze golda prawn?', 'Yes. Rinse, pat dry and freeze in airtight bags for up to three months.'],
])}
${shop('Order Sundarban crab and golda prawn')}`,
  },

  /* ------------------------------------------------------------------ Healthy Recipes */
  {
    category: 'healthy-recipes',
    slug: 'shorshe-ilish-recipe',
    title: 'Authentic Shorshe Ilish Recipe (Hilsa in Mustard Sauce)',
    excerpt: 'The king of Bengali dishes made the traditional way, with fresh hilsa, mustard paste, green chilli and mustard oil. Ready in 30 minutes.',
    tags: ['shorshe ilish', 'hilsa recipe', 'bengali food', 'fish recipe'],
    featured: true,
    meta_title: 'Shorshe Ilish Recipe: Hilsa in Mustard Sauce',
    meta_description: 'Step-by-step shorshe ilish recipe: fresh hilsa cooked in mustard paste with green chillies and mustard oil. Authentic Bengali taste, ready in 30 minutes.',
    content: `<p>Shorshe ilish is the dish every Bangladeshi family waits for in monsoon. It is simple and quick, and all about the quality of the fish. Start with fresh, fatty hilsa; here is ${post('hilsa-ilish-nutrition-and-season', 'how to choose the best hilsa')}.</p>
<h2>Ingredients (serves 4)</h2><ul><li>6 pieces of fresh hilsa</li><li>2 tbsp yellow mustard seeds and 1 tbsp black mustard seeds</li><li>5 to 6 green chillies</li><li>½ tsp turmeric powder</li><li>4 tbsp mustard oil</li><li>Salt to taste</li></ul>
<h2>Method</h2><ol><li>Soak the mustard seeds in warm water for 15 minutes, then grind with two green chillies and a pinch of salt into a smooth paste.</li><li>Rub the fish with salt and a little turmeric and rest for 10 minutes.</li><li>Mix the mustard paste with half a cup of water, the remaining turmeric and two tablespoons of mustard oil.</li><li>Arrange the fish in a wide pan in one layer, pour the sauce over and add slit green chillies.</li><li>Cover and cook on low heat for 10 to 12 minutes. Do not stir; gently shake the pan instead so the fish doesn’t break.</li><li>Turn off the heat and finish with a drizzle of raw mustard oil. Serve with steamed rice.</li></ol>
<h2>Tips for perfect shorshe ilish</h2><ul><li><strong>Bitter mustard?</strong> Grind briefly, add salt while grinding and avoid over-blending.</li><li><strong>Bhapa ilish:</strong> put the same mixture in a covered steel bowl and steam for 15 minutes.</li><li>Use the oiliest middle pieces (peti) for the softest result.</li></ul>
${faq([
  ['Why does my mustard paste taste bitter?', 'Over-grinding or using only black mustard seeds makes it bitter. Mix yellow and black seeds and grind with salt and green chilli.'],
  ['Can I make shorshe ilish with frozen hilsa?', 'Yes. Thaw it slowly in the fridge overnight and pat dry before cooking.'],
])}
${shop('Buy fresh hilsa for this recipe')}`,
  },
  {
    category: 'healthy-recipes',
    slug: 'honey-lemon-ginger-tea-recipe',
    title: 'Honey Lemon Ginger Tea: A Natural Remedy for Cold and Cough',
    excerpt: 'A warming three-ingredient tea that soothes the throat and supports immunity. Ready in five minutes with raw Sundarban honey.',
    tags: ['honey recipe', 'ginger tea', 'cold remedy', 'immunity'],
    meta_title: 'Honey Lemon Ginger Tea Recipe for Cold and Cough',
    meta_description: 'Make soothing honey lemon ginger tea in 5 minutes. A natural home remedy for cold, cough and sore throat, made with raw Sundarban honey and fresh ginger.',
    content: `<p>When the weather changes, this simple tea is the first thing many families in Bangladesh reach for. It combines three natural ingredients that work together beautifully.</p>
<h2>Ingredients (1 cup)</h2><ul><li>1 cup water</li><li>1 inch fresh ginger, thinly sliced</li><li>1 tsp raw Sundarban honey</li><li>½ lemon</li><li>Optional: 4 to 5 tulsi leaves, a pinch of black pepper or a small cinnamon stick</li></ul>
<h2>Method</h2><ol><li>Boil the water with ginger (and tulsi or cinnamon, if using) for 3 to 4 minutes.</li><li>Strain into a cup and let it cool for one minute.</li><li>Squeeze in the lemon juice and stir in the honey.</li><li>Sip slowly while warm.</li></ol>
<h2>Why it works</h2><ul><li><strong>Ginger</strong> warms the body, eases congestion and helps digestion.</li><li><strong>Lemon</strong> adds vitamin C.</li><li><strong>Honey</strong> coats and soothes the throat and has mild antibacterial properties. Read about ${post('health-benefits-of-raw-sundarban-honey', 'the health benefits of raw honey')}.</li></ul>
<h2>The most important tip</h2><p>Always add honey after the water has cooled slightly, below about 60°C. Boiling honey destroys its natural enzymes. And make sure your honey is real; here are ${post('how-to-identify-pure-honey-at-home', '7 ways to test it at home')}.</p>
${faq([
  ['How many times a day can I drink honey ginger tea?', 'Two to three cups a day is fine for most adults during a cold.'],
  ['Can children drink honey lemon tea?', 'Yes, for children over one year old. Never give honey to babies under 12 months.'],
])}
${shop('Buy raw honey for your tea')}`,
  },
  {
    category: 'healthy-recipes',
    slug: 'golda-chingri-malai-curry-recipe',
    title: 'Golda Chingri Malai Curry: Bengali Prawn in Coconut Milk',
    excerpt: 'Giant golda prawns simmered in a creamy, gently spiced coconut milk gravy. The festive Bengali classic, made easy at home.',
    tags: ['chingri malai curry', 'golda prawn', 'prawn recipe', 'bengali food'],
    meta_title: 'Golda Chingri Malai Curry Recipe (Prawn Coconut Curry)',
    meta_description: 'Authentic Bengali chingri malai curry: golda prawns in creamy coconut milk with mild spices. Step-by-step recipe with tips, ready in 40 minutes.',
    content: `<p>Chingri malai curry is the star of Bengali weddings and Eid feasts. Its rich coconut gravy lets the natural sweetness of golda prawn shine. Choosing good prawns matters most; see our ${post('mud-crab-and-golda-prawn-buying-guide', 'golda prawn buying guide')}.</p>
<h2>Ingredients (serves 4)</h2><ul><li>8 large golda prawns, cleaned, heads on, veins removed</li><li>1 cup thick coconut milk</li><li>1 large onion, ground into a paste</li><li>1 tsp ginger paste</li><li>½ tsp turmeric, ½ tsp chilli powder</li><li>2 green cardamoms, 1 small cinnamon stick, 1 bay leaf</li><li>3 to 4 green chillies, slit</li><li>1 tsp sugar, salt to taste</li><li>2 tbsp mustard oil and 1 tbsp ghee</li></ul>
<h2>Method</h2><ol><li>Rub the prawns with salt and turmeric and fry lightly in mustard oil for one minute per side. Set aside.</li><li>In the same pan, add ghee, cardamom, cinnamon and bay leaf until fragrant.</li><li>Add the onion paste and cook on medium heat until golden, about 6 to 8 minutes.</li><li>Add ginger paste, turmeric and chilli powder with a splash of water; cook until the oil separates.</li><li>Pour in the coconut milk, add sugar and salt, and bring to a gentle simmer.</li><li>Add the prawns and green chillies. Simmer for 5 to 6 minutes, until the prawns are just cooked and the gravy is creamy.</li><li>Finish with a teaspoon of ghee and serve with steamed rice or polao.</li></ol>
<h2>Tips</h2><ul><li>Don’t overcook prawns, or they turn rubbery.</li><li>Press the prawn heads gently while cooking; the juices give the curry its deep flavour.</li><li>Use fresh coconut milk for the richest taste.</li></ul>
${faq([
  ['Can I use frozen golda prawn?', 'Yes. Thaw it overnight in the fridge and pat dry before frying.'],
  ['What goes best with chingri malai curry?', 'Steamed white rice or a light polao.'],
])}
${shop('Order fresh golda prawn')}`,
  },

  /* ------------------------------------------------------------------ Sundarbans Stories */
  {
    category: 'sundarbans-stories',
    slug: 'moual-honey-hunters-of-the-sundarbans',
    title: 'The Moual Honey Hunters of the Sundarbans',
    excerpt: 'Every April, brave Moual collectors enter the mangrove forest to harvest wild honey, sharing it with tigers, tides and bees. This is their story.',
    tags: ['sundarbans', 'moual', 'wild honey', 'honey hunting'],
    featured: true,
    meta_title: 'Moual Honey Hunters: How Sundarban Wild Honey Is Collected',
    meta_description: 'Meet the Moual honey hunters of the Sundarbans and learn how wild mangrove honey is collected sustainably every spring, from smoke to comb to jar.',
    content: `<p>Deep inside the Sundarbans, the world’s largest mangrove forest, lives a community whose livelihood depends on wild bees: the Mouals. Their knowledge has been passed down for generations.</p>
<h2>The honey season</h2><p>The official honey season begins on 1 April, when the Forest Department issues collection permits. Groups of seven to ten Mouals set off by wooden boat for two to three weeks inside the forest.</p>
<h2>A dangerous job</h2><p>The Sundarbans is home to the Royal Bengal Tiger, crocodiles and fast tides. Mouals always work in groups, keep watch for each other and rely on deep knowledge of the forest to stay safe.</p>
<h2>How wild honey is collected</h2><ol><li>Collectors follow bees flying back to their hive through the mangrove trees.</li><li>A bundle of dry leaves is lit to create smoke, which calms the giant rock bees.</li><li>Only the honey-filled part of the comb is cut. The brood section with young bees is left behind.</li><li>The honey is squeezed by hand into clean containers and brought back by boat.</li></ol>
<h2>Sustainable harvesting</h2><p>Leaving part of the hive is the most important rule. It allows the colony to recover and keeps the bee population healthy for the next season.</p>
<h2>Honey of every season</h2><p>Depending on which trees are blooming, the Mouals bring back very different honey. Learn about ${post('types-of-sundarban-honey', 'Khalisha, Goran, Keora and Bain honey')}.</p>
<h2>From the forest to your home</h2><p>Mangrove Collection works directly with Moual families, paying fair prices and bringing their raw honey straight to you, with no middlemen and no mixing.</p>
${faq([
  ['When is honey collected in the Sundarbans?', 'The main season runs from April to June, starting with Khalisha honey in early April.'],
  ['Is Sundarban honey wild?', 'Yes. It is made by wild giant rock bees (Apis dorsata) nesting in the mangrove forest.'],
])}
${shop('Buy honey collected by Moual families')}`,
  },
  {
    category: 'sundarbans-stories',
    slug: 'types-of-sundarban-honey',
    title: 'Khalisha, Goran, Keora and Bain: Types of Sundarban Honey',
    excerpt: 'Sundarban honey changes with the flowers. Learn the colour, taste and best uses of Khalisha, Goran, Keora and Bain honey.',
    tags: ['khalisha honey', 'goran honey', 'keora honey', 'sundarban honey'],
    meta_title: 'Types of Sundarban Honey: Khalisha, Goran, Keora, Bain',
    meta_description: 'Compare the 4 main types of Sundarban mangrove honey: colour, taste, harvest season and best uses of Khalisha, Goran, Keora and Bain honey.',
    content: `<p>The colour and taste of Sundarban honey depend on which mangrove trees are in bloom when the bees collect nectar. Here are the four main varieties gathered by ${post('moual-honey-hunters-of-the-sundarbans', 'Moual honey hunters')}.</p>
<h2>Khalisha honey</h2><p>Harvested in early April, Khalisha honey is light golden with a delicate floral flavour and a smooth finish. It is considered the finest and most sought-after Sundarban honey.</p>
<h2>Goran honey</h2><p>Goran flowers produce a darker amber honey with a stronger, bold and slightly bitter-sweet taste. It is rich in minerals and antioxidants.</p>
<h2>Keora honey</h2><p>Collected later in the season, Keora honey is thinner and slightly tangy. It is high in glucose, so it ${post('why-honey-crystallizes', 'crystallises quickly')}.</p>
<h2>Bain honey</h2><p>Bain honey is reddish-brown and thick, with an earthy flavour that works well in cooking.</p>
<h2>Which one should you choose?</h2><ul><li><strong>For tea and everyday eating:</strong> Khalisha</li><li><strong>For health remedies:</strong> Goran, the darkest and richest in antioxidants</li><li><strong>For cooking and baking:</strong> Keora or Bain</li></ul>
<p>Whatever you choose, make sure it is raw. Read about ${post('health-benefits-of-raw-sundarban-honey', 'the health benefits of raw honey')}.</p>
${faq([
  ['Which Sundarban honey is the best?', 'Khalisha honey is the most popular for its light colour and floral taste, while Goran is preferred for its stronger flavour and antioxidants.'],
  ['Why is Sundarban honey sometimes thin?', 'Mangrove honey naturally contains more moisture than many other honeys, so a thinner texture is normal.'],
])}
${shop('Shop Khalisha and Goran honey')}`,
  },
  {
    category: 'sundarbans-stories',
    slug: 'life-of-sundarban-fishermen',
    title: 'A Day in the Life of Sundarban Fishermen',
    excerpt: 'Before sunrise, small wooden boats leave the river villages. Follow a day with the fishermen who bring fresh fish, crab and prawn to your table.',
    tags: ['sundarbans', 'fishermen', 'fresh fish', 'fair trade'],
    meta_title: 'Life of Sundarban Fishermen: Where Your Fish Comes From',
    meta_description: 'Follow a day in the life of Sundarban fishermen, from pre-dawn nets on the river to the ice boxes that keep fish, crab and prawn fresh for your kitchen.',
    content: `<p>Villages along the Pasur, Shibsa and Rupsha rivers wake up long before dawn. For thousands of families on the edge of the Sundarbans, fishing is not just a job; it is a way of life.</p>
<h2>Before sunrise</h2><p>By 4 a.m. the small wooden boats are on the water. Nets set the evening before are pulled in by hand, often by two or three family members working together.</p>
<h2>The catch</h2><p>Depending on the season, the nets bring parshe, bhetki, tengra, pomfret, shrimp and ${post('mud-crab-and-golda-prawn-buying-guide', 'mud crab')}. In monsoon, the lucky ones find ${post('hilsa-ilish-nutrition-and-season', 'hilsa')}.</p>
<h2>Keeping it fresh</h2><p>Fish are sorted on the boat and packed in ice within hours, then taken to landing centres in Khulna and Mongla. Speed is everything, because freshness can’t be added later.</p>
<h2>Life on the edge</h2><ul><li>Cyclones and rising salinity threaten homes and fishing grounds.</li><li>Seasonal fishing bans protect breeding but mean weeks without income.</li><li>Middlemen often take most of the profit.</li></ul>
<h2>Fair trade, fresher fish</h2><p>By buying directly from fishing communities, we pay fishermen better prices and get fish to your table faster, with no formalin and no long cold-storage chains. Here is ${post('how-to-choose-fresh-sea-fish', 'how to recognise truly fresh fish')}.</p>
${shop('Support local fishermen, order fresh fish')}`,
  },

  /* ------------------------------------------------------------------ Buying & Storage Guide */
  {
    category: 'buying-storage-guide',
    slug: 'why-honey-crystallizes',
    title: 'Why Does Honey Crystallise? (And How to Fix It Safely)',
    excerpt: 'Crystallised honey is not spoiled. It is often a sign of pure honey. Learn why it happens and how to make it runny again without losing nutrients.',
    tags: ['honey storage', 'crystallised honey', 'pure honey'],
    meta_title: 'Why Honey Crystallises and How to Decrystallise It',
    meta_description: 'Crystallised honey is natural, not fake. Learn why raw honey turns solid in winter, how to make it liquid again safely and how to store honey properly.',
    content: `<p>Every winter customers ask us: “My honey turned solid. Is it fake?” The answer is no. Crystallisation is completely natural and very common in raw honey.</p>
<h2>Why honey crystallises</h2><p>Honey is a supersaturated mix of two sugars, glucose and fructose. Over time, glucose separates from the water and forms tiny crystals, especially below 15°C.</p>
<h2>Which honey crystallises faster?</h2><ul><li>Honey high in glucose, such as Keora (see ${post('types-of-sundarban-honey', 'types of Sundarban honey')})</li><li>Raw honey containing natural pollen and wax particles</li><li>Honey kept in a cold room or the fridge</li></ul>
<h2>How to make crystallised honey liquid again</h2><ol><li>Place the closed glass jar in a bowl of warm water, about 40°C (comfortably hot to the touch).</li><li>Leave it for 15 to 20 minutes, stirring occasionally, and replace the water as it cools.</li><li>Never microwave or boil honey, as high heat destroys its enzymes and aroma.</li></ol>
<h2>How to store honey</h2><ul><li>Keep it in a glass jar with a tight lid</li><li>Store at room temperature, away from direct sunlight</li><li>Don’t refrigerate</li><li>Always use a clean, dry spoon, because water causes fermentation</li></ul>
<p>Still unsure if your honey is genuine? Try these ${post('how-to-identify-pure-honey-at-home', '7 home tests for pure honey')}.</p>
${faq([
  ['Is crystallised honey safe to eat?', 'Yes. It is perfectly safe and has the same nutrition. Many people love its creamy texture.'],
  ['Does pure honey expire?', 'Properly stored honey lasts for years. Keep it sealed and dry.'],
])}
${shop('Buy raw, unprocessed honey')}`,
  },
  {
    category: 'buying-storage-guide',
    slug: 'how-to-store-and-freeze-fish',
    title: 'How to Store and Freeze Fresh Fish the Right Way',
    excerpt: 'Proper cleaning, drying and packing keep fish tasting fresh for months. A practical guide for every home freezer, including safe thawing.',
    tags: ['fish storage', 'freezing fish', 'kitchen tips', 'food safety'],
    meta_title: 'How to Freeze Fish at Home and Keep It Fresh for Months',
    meta_description: 'Step-by-step guide to cleaning, drying, packing and freezing fresh fish, crab and prawn at home, with storage times and how to thaw fish safely.',
    content: `<p>Buying fish in bulk saves money and trips to the market, as long as you store it correctly. Follow these steps to keep fish tasting fresh.</p>
<h2>Step 1: Clean quickly</h2><p>Scale, gut and wash the fish as soon as it arrives. Remove the dark blood line along the spine, which spoils first.</p>
<h2>Step 2: Dry thoroughly</h2><p>Pat each piece completely dry with a clean cloth or kitchen paper. Extra water forms ice crystals that ruin the texture.</p>
<h2>Step 3: Portion and pack</h2><ul><li>Pack one meal’s worth per bag so you only thaw what you need</li><li>Squeeze out as much air as possible to prevent freezer burn</li><li>Label each bag with the date and type of fish</li></ul>
<h2>Step 4: Freeze fast</h2><p>Lay the bags flat in the coldest part of the freezer. Flat bags freeze faster and stack neatly.</p>
<h2>How long does fish last?</h2><ul><li><strong>Fridge:</strong> 1 to 2 days</li><li><strong>Oily fish like hilsa:</strong> up to 3 months frozen</li><li><strong>White fish like bhetki and pomfret:</strong> up to 6 months frozen</li><li><strong>Prawn:</strong> up to 3 months frozen</li><li><strong>Crab:</strong> best cooked fresh; cooked crab meat freezes for 2 months</li></ul>
<h2>How to thaw fish safely</h2><p>Thaw overnight in the fridge, never at room temperature. For a quick thaw, place the sealed bag in cold water for 30 to 60 minutes.</p>
<p>Start with the freshest catch. Here is ${post('how-to-choose-fresh-sea-fish', 'how to choose fresh sea fish')}.</p>
${faq([
  ['Should I wash fish before freezing?', 'Yes, rinse it and then dry it completely before packing.'],
  ['Can I refreeze thawed fish?', 'Only if it was thawed in the fridge and not left out. Quality will drop, so cook it instead if you can.'],
])}
${shop('Order fresh fish, packed on ice')}`,
  },
  {
    category: 'buying-storage-guide',
    slug: 'buying-natural-food-online-bangladesh',
    title: 'Buying Honey and Fish Online in Bangladesh: A 7-Point Checklist',
    excerpt: 'Online shopping for honey and fish is convenient, but not every seller is honest. Use this checklist before you place your next order.',
    tags: ['online shopping', 'natural food', 'bangladesh', 'buying guide'],
    meta_title: 'Buying Honey and Fish Online in Bangladesh: Checklist',
    meta_description: 'A practical 7-point checklist for buying natural honey and fresh fish online in Bangladesh: sourcing, cold-chain delivery, payment, reviews and support.',
    content: `<p>More families in Dhaka, Chattogram, Sylhet and beyond now order natural food online. Here is how to choose a seller you can trust.</p>
<h2>1. Clear sourcing</h2><p>A good seller tells you exactly where the product comes from: which forest, which river, which season. Vague claims like “natural” or “organic” without details are a red flag.</p>
<h2>2. Real photos and honest reviews</h2><p>Look for real product photos, not stock images, and verified customer reviews with photos.</p>
<h2>3. Cold-chain delivery for fish</h2><p>Fish, crab and prawn must arrive on ice in insulated packaging. Ask how long delivery takes to your district.</p>
<h2>4. Cash on delivery</h2><p>Cash on delivery lets you check the product before you pay, a sign the seller is confident in its quality.</p>
<h2>5. Secure mobile payments</h2><p>bKash, Nagad and Rocket payments should be confirmed with a transaction ID and a clear order number.</p>
<h2>6. Easy order tracking</h2><p>You should be able to check your order status at any time, without calling.</p>
<h2>7. Responsive support</h2><p>A WhatsApp or Messenger contact makes it easy to ask questions before and after you buy.</p>
<h2>When your order arrives</h2><ul><li>Check fish for ${post('how-to-choose-fresh-sea-fish', 'the 6 signs of freshness')}</li><li>Test honey with ${post('how-to-identify-pure-honey-at-home', 'simple home tests')}</li><li>Store everything properly: ${post('how-to-store-and-freeze-fish', 'freezing fish')} and ${post('why-honey-crystallizes', 'storing honey')}</li></ul>
${faq([
  ['Is it safe to buy fish online in Bangladesh?', 'Yes, if the seller sources directly, packs fish on ice and delivers quickly in insulated boxes.'],
  ['Does Mangrove Collection deliver outside Dhaka?', 'Yes. We deliver across Bangladesh, with cash on delivery and mobile payment options.'],
])}
${shop('Start shopping at Mangrove Collection')}`,
  },
]

async function storeCover(slug: string, adminId: bigint | null): Promise<string> {
  const file = `${slug}.jpg`
  const jpeg = await sharp(await readFile(join(paths.seedImages, 'blog', file)))
    .resize(COVER.width, COVER.height, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()

  const now = new Date()
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/blog-${slug}-${randomLower(6)}.jpg`
  await storage.put('public', path, jpeg)
  await prisma.media.create({ data: { disk: 'public', path, original_name: file, mime_type: 'image/jpeg', size: BigInt(jpeg.length), uploaded_by: adminId } })
  return storage.url('public', path)
}

const adminId = (await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true } }))?.id ?? null

const categories = new Map<string, bigint>()
for (const [index, data] of CATEGORIES.entries()) {
  const category = await prisma.blogCategory.upsert({
    where: { slug: data.slug },
    create: { ...data, is_active: true, sort_order: index },
    update: {},
  })
  categories.set(data.slug, category.id)
}

const DAY = 86_400_000
const today = Math.floor(Date.now() / 1000) * 1000

for (const [index, item] of POSTS.entries()) {
  if (await prisma.blogPost.findUnique({ where: { slug: item.slug }, select: { id: true } })) {
    console.log(`  Skipped ${item.title} (already exists)`)
    continue
  }

  const { category, featured, ...fields } = item
  await prisma.blogPost.create({
    data: {
      ...fields,
      content: fields.content.replace(/\n/g, ''),
      blog_category_id: categories.get(category)!,
      author_id: adminId,
      cover_image: await storeCover(item.slug, adminId),
      status: 'published',
      is_featured: featured ?? false,
      // Spread over the last weeks so "latest" ordering looks natural.
      published_at: new Date(today - (POSTS.length - index) * 2 * DAY),
    },
  })
  console.log(`  Created ${item.title}`)
}

await prisma.$disconnect()
