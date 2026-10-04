/**
 * Starter blog: 5 categories and 20 SEO-focused articles about Sundarban honey and sea fish (`pnpm db:seed:blog`).
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

type Photo = 'khalisha' | 'goran' | 'hilsa' | 'bhetki' | 'pomfret' | 'parshe'

const PHOTOS: Record<Photo, string> = {
  khalisha: 'sundarban-khalisha-honey.jpg',
  goran: 'sundarban-goran-honey.jpg',
  hilsa: 'fresh-hilsa.jpg',
  bhetki: 'fresh-bhetki.jpg',
  pomfret: 'fresh-pomfret.jpg',
  parshe: 'fresh-parshe.jpg',
}

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
    description: 'Everything about fresh Bay of Bengal sea fish: hilsa, bhetki, pomfret, parshe, nutrition, seasons and how to choose the freshest catch.',
  },
  {
    slug: 'healthy-recipes',
    name: 'Healthy Recipes',
    icon: 'chef-hat',
    description: 'Easy Bangladeshi recipes with natural honey and fresh sea fish, from shorshe ilish to honey lemon tea.',
  },
  {
    slug: 'sundarbans-stories',
    name: 'Sundarbans Stories',
    icon: 'trees',
    description: 'Stories from the world’s largest mangrove forest: Moual honey hunters, fishing communities and sustainable harvesting.',
  },
  {
    slug: 'buying-storage-guide',
    name: 'Buying & Storage Guide',
    icon: 'package-check',
    description: 'Practical tips on buying natural products online in Bangladesh, storing honey and freezing fish the right way.',
  },
] as const

type CategorySlug = (typeof CATEGORIES)[number]['slug']

type SeedPost = {
  category: CategorySlug
  slug: string
  title: string
  excerpt: string
  photo: Photo
  tags: string[]
  featured?: boolean
  meta_title: string
  meta_description: string
  content: string
}

const shopLink = '<p><strong>Ready to taste the difference?</strong> Browse our <a href="/shop/">natural honey and fresh sea fish</a>, delivered across Bangladesh.</p>'

const POSTS: SeedPost[] = [
  // Honey & Health
  {
    category: 'honey-health-benefits',
    slug: 'health-benefits-of-raw-sundarban-honey',
    title: '10 Proven Health Benefits of Raw Sundarban Honey',
    excerpt: 'Raw Sundarban honey is more than a sweetener. Discover ten science-backed benefits, from better sleep to a stronger immune system.',
    photo: 'khalisha',
    tags: ['honey', 'health benefits', 'raw honey', 'sundarban honey'],
    featured: true,
    meta_title: '10 Health Benefits of Raw Sundarban Honey (Backed by Science)',
    meta_description: 'Learn the top 10 health benefits of raw Sundarban mangrove honey: immunity, digestion, energy, sleep, skin care and more.',
    content: `<p>Raw honey from the Sundarban mangrove forest is collected from wild bees that feed on Khalisha, Goran and Keora blossoms. Because it is never heated or filtered, it keeps the enzymes, antioxidants and pollen that processed supermarket honey loses.</p>
<h2>1. Rich in natural antioxidants</h2><p>Raw honey contains flavonoids and phenolic acids that help the body fight oxidative stress. Darker honey such as Goran usually has the highest antioxidant level.</p>
<h2>2. Supports a healthy immune system</h2><p>A spoon of honey with warm water and lemon in the morning is a traditional Bangladeshi remedy. Its mild antibacterial properties help the body during seasonal changes.</p>
<h2>3. Soothes cough and sore throat</h2><p>Studies show honey can calm a night-time cough as effectively as many over-the-counter syrups. Take one teaspoon before bed (not for babies under one year).</p>
<h2>4. Natural energy booster</h2><p>Honey is a mix of glucose and fructose, giving quick and lasting energy. Many athletes take it before a workout.</p>
<h2>5. Helps digestion</h2><p>Raw honey works as a prebiotic, feeding the good bacteria in your gut.</p>
<h2>6. Better sleep</h2><p>A little honey in warm milk helps the brain release melatonin, the sleep hormone.</p>
<h2>7. Heals minor wounds and burns</h2><p>Honey has been used on wounds for centuries thanks to its antibacterial and moisturising effect.</p>
<h2>8. Healthy skin</h2><p>Use it as a face mask with a few drops of lemon to clean pores and keep skin soft.</p>
<h2>9. A smarter sugar swap</h2><p>Replacing white sugar with a smaller amount of honey adds flavour and nutrients.</p>
<h2>10. Supports heart health</h2><p>Its antioxidants may help maintain healthy blood pressure and cholesterol levels as part of a balanced diet.</p>
<h3>How much honey should you eat?</h3><p>One to two tablespoons a day is enough for most adults. People with diabetes should speak to a doctor first.</p>
${shopLink}`,
  },
  {
    category: 'honey-health-benefits',
    slug: 'how-to-identify-pure-honey-at-home',
    title: 'How to Identify Pure Honey at Home: 7 Simple Tests',
    excerpt: 'Fake and adulterated honey is common. Use these seven easy home tests to check whether your honey is pure before you buy again.',
    photo: 'goran',
    tags: ['pure honey', 'honey test', 'fake honey', 'buying guide'],
    featured: true,
    meta_title: 'How to Check Pure Honey at Home – 7 Easy Tests',
    meta_description: 'Is your honey real? Try these 7 simple home tests (water, thumb, flame, paper, vinegar) to spot fake or adulterated honey.',
    content: `<p>Honey mixed with sugar syrup is sold widely in Bangladesh. The good news: you can spot most fake honey with things already in your kitchen.</p>
<h2>1. The water test</h2><p>Drop a spoon of honey into a glass of water. Pure honey sinks and settles at the bottom. Fake honey starts dissolving immediately.</p>
<h2>2. The thumb test</h2><p>Put a drop on your thumb. Pure honey stays in place; diluted honey spreads and runs.</p>
<h2>3. The paper test</h2><p>Drop honey on blotting paper. Real honey does not soak through quickly.</p>
<h2>4. The flame test</h2><p>Dip a dry matchstick in honey and strike it. Pure honey has no added water, so the match still lights.</p>
<h2>5. The vinegar test</h2><p>Mix honey with water and a few drops of vinegar. Foam suggests the honey contains chalk or plaster.</p>
<h2>6. Crystallisation</h2><p>Natural honey crystallises in cold weather. Many people think this means it is spoiled, but it is actually a sign of purity.</p>
<h2>7. Taste and smell</h2><p>Real Sundarban honey has a floral smell and a slightly warm aftertaste. Fake honey tastes only of sugar.</p>
<h3>Buy from a trusted source</h3><p>Home tests help, but the safest option is buying from collectors who know exactly where their honey comes from. At Mangrove Collection every batch comes directly from Moual honey hunters.</p>
${shopLink}`,
  },
  {
    category: 'honey-health-benefits',
    slug: 'honey-vs-sugar-which-is-healthier',
    title: 'Honey vs Sugar: Which Is Healthier for Your Family?',
    excerpt: 'Both are sweet, but honey and sugar act very differently in the body. Here is a clear comparison of calories, nutrition and glycemic index.',
    photo: 'khalisha',
    tags: ['honey vs sugar', 'healthy eating', 'nutrition'],
    meta_title: 'Honey vs Sugar – Calories, Glycemic Index & Health Compared',
    meta_description: 'Honey or sugar? Compare calories, glycemic index, vitamins and minerals, and learn how to switch to honey the healthy way.',
    content: `<p>Swapping white sugar for natural honey is one of the easiest diet changes you can make. But is honey really better? Let's compare.</p>
<h2>Calories</h2><p>A teaspoon of honey has about 21 calories, while sugar has about 16. However, honey is sweeter, so you naturally use less.</p>
<h2>Glycemic index</h2><p>Honey has a glycemic index of around 50–58, lower than table sugar at about 65. That means a slower rise in blood sugar.</p>
<h2>Nutrients</h2><ul><li><strong>Sugar:</strong> pure sucrose, no vitamins or minerals.</li><li><strong>Raw honey:</strong> small amounts of vitamin C, B vitamins, potassium, calcium, iron and antioxidants.</li></ul>
<h2>Digestion</h2><p>Honey's natural enzymes make it easier to digest, and it acts as a prebiotic for gut health.</p>
<h2>How to switch</h2><ul><li>Use ¾ cup of honey for every cup of sugar in recipes.</li><li>Add honey to tea once it has cooled slightly to protect its enzymes.</li><li>Start with breakfast: honey on toast, in yoghurt or oatmeal.</li></ul>
<h3>The verdict</h3><p>Honey is still a sugar, so moderation matters. But raw, unprocessed honey gives you flavour and nutrition that white sugar simply cannot.</p>
${shopLink}`,
  },
  {
    category: 'honey-health-benefits',
    slug: 'honey-lemon-warm-water-weight-loss',
    title: 'Honey, Lemon and Warm Water: Does It Help Weight Loss?',
    excerpt: 'The morning honey lemon drink is popular across Bangladesh. We look at what it really does for weight, digestion and hydration.',
    photo: 'goran',
    tags: ['weight loss', 'honey lemon', 'morning drink'],
    meta_title: 'Honey Lemon Warm Water for Weight Loss – Facts & Recipe',
    meta_description: 'Does honey lemon water help you lose weight? Learn the real benefits, the right recipe and the best time to drink it.',
    content: `<p>Warm water with honey and lemon is a classic morning drink. It won't melt fat on its own, but it can support a healthy routine.</p>
<h2>What it actually does</h2><ul><li><strong>Hydration:</strong> starting the day with a glass of water wakes up your metabolism.</li><li><strong>Fewer cravings:</strong> a little natural sweetness can reduce the urge for sugary snacks.</li><li><strong>Digestion:</strong> lemon and honey together help the stomach get ready for breakfast.</li></ul>
<h2>The right recipe</h2><ol><li>Heat one glass of water until warm, not boiling.</li><li>Add one teaspoon of raw honey.</li><li>Squeeze in half a lemon.</li><li>Drink 20–30 minutes before breakfast.</li></ol>
<h2>Common mistakes</h2><ul><li>Using boiling water, which destroys honey's enzymes.</li><li>Adding too much honey — one teaspoon is enough.</li><li>Using processed honey with added syrup.</li></ul>
<h3>Bottom line</h3><p>Honey lemon water is a healthy habit that supports weight goals when combined with balanced meals and exercise.</p>
${shopLink}`,
  },

  // Sea Fish Guide
  {
    category: 'sea-fish-guide',
    slug: 'how-to-choose-fresh-sea-fish',
    title: 'How to Choose Fresh Sea Fish: A Complete Guide',
    excerpt: 'Eyes, gills, smell and texture tell you everything. Learn how to pick the freshest sea fish every time, at the market or online.',
    photo: 'pomfret',
    tags: ['fresh fish', 'sea fish', 'buying guide'],
    featured: true,
    meta_title: 'How to Choose Fresh Sea Fish – 6 Signs of Freshness',
    meta_description: 'Learn the 6 signs of fresh sea fish: clear eyes, red gills, firm flesh, shiny skin, clean smell and bright scales.',
    content: `<p>Fresh fish tastes sweet, cooks evenly and is safer to eat. Here are the signs that experienced fish buyers in Khulna and Chattogram look for.</p>
<h2>1. Clear, bulging eyes</h2><p>Fresh fish has bright, clear eyes. Cloudy or sunken eyes mean the fish is old.</p>
<h2>2. Bright red gills</h2><p>Lift the gill cover. It should be bright red or pink, never brown or grey.</p>
<h2>3. Firm flesh</h2><p>Press the body gently. Fresh flesh springs back; old fish leaves a dent.</p>
<h2>4. Shiny skin and tight scales</h2><p>The skin should look wet and metallic, with scales firmly attached.</p>
<h2>5. Clean ocean smell</h2><p>Fresh sea fish smells like the sea. A strong fishy or ammonia smell is a warning sign.</p>
<h2>6. No formalin</h2><p>Fish treated with formalin often looks unnaturally stiff and flies avoid it. Always buy from sellers who guarantee formalin-free fish.</p>
<h3>Buying fish online</h3><p>Choose a seller that packs fish on ice the same day it is caught and delivers in insulated boxes. That's how every order at Mangrove Collection is shipped.</p>
${shopLink}`,
  },
  {
    category: 'sea-fish-guide',
    slug: 'hilsa-ilish-nutrition-and-season',
    title: 'Hilsa (Ilish): Nutrition, Best Season and How to Buy',
    excerpt: 'Bangladesh’s national fish is rich in omega-3. Find out when hilsa tastes best, how to spot river hilsa and how to store it.',
    photo: 'hilsa',
    tags: ['hilsa', 'ilish', 'omega-3', 'sea fish'],
    featured: true,
    meta_title: 'Hilsa Fish (Ilish) – Nutrition, Season & Buying Tips',
    meta_description: 'Everything about hilsa: omega-3 nutrition, the best months to buy, how to identify Padma-Meghna ilish and storage tips.',
    content: `<p>Hilsa, or ilish, is more than a fish in Bangladesh — it's a celebration. Its rich, oily flesh is loved in shorshe ilish, bhapa and fry.</p>
<h2>Nutrition</h2><ul><li>High in omega-3 fatty acids for heart and brain health</li><li>Excellent source of protein</li><li>Rich in vitamin D, vitamin A, calcium and iron</li></ul>
<h2>Best season</h2><p>Hilsa is at its best during the monsoon, from July to October, when it swims from the Bay of Bengal into the rivers to spawn. Fishing is banned for 22 days around the October full moon to protect breeding.</p>
<h2>How to identify quality hilsa</h2><ul><li>Bright silver body with a slight pink tint</li><li>Broad, thick back — a sign of high fat</li><li>Small head relative to the body</li><li>Fish of 1 kg or more have the richest taste</li></ul>
<h2>Storage</h2><p>Clean the fish, pat it dry, and freeze in airtight bags. Hilsa keeps its flavour for about three months in the freezer.</p>
${shopLink}`,
  },
  {
    category: 'sea-fish-guide',
    slug: 'omega-3-sea-fish-benefits',
    title: 'Why Sea Fish Is the Best Source of Omega-3',
    excerpt: 'Omega-3 fatty acids protect the heart, brain and eyes. Learn which Bangladeshi sea fish contain the most and how much to eat.',
    photo: 'bhetki',
    tags: ['omega-3', 'healthy fish', 'nutrition'],
    meta_title: 'Omega-3 in Sea Fish – Benefits & Best Fish in Bangladesh',
    meta_description: 'Discover the benefits of omega-3 from sea fish and which local fish (hilsa, pomfret, bhetki) give you the most.',
    content: `<p>Omega-3 fatty acids (EPA and DHA) are essential fats the body cannot make by itself. Sea fish is by far the best natural source.</p>
<h2>Benefits of omega-3</h2><ul><li><strong>Heart:</strong> lowers triglycerides and supports healthy blood pressure.</li><li><strong>Brain:</strong> important for memory and children's brain development.</li><li><strong>Eyes:</strong> DHA is a key part of the retina.</li><li><strong>Joints:</strong> helps reduce inflammation.</li></ul>
<h2>Best local sea fish for omega-3</h2><ol><li>Hilsa (ilish) — the richest</li><li>Silver pomfret (rupchanda)</li><li>Bhetki (sea bass)</li><li>Mackerel and sardines</li></ol>
<h2>How much should you eat?</h2><p>Nutritionists recommend two servings of fish per week. Steaming, baking and light curries keep the most omega-3; deep frying reduces it.</p>
${shopLink}`,
  },
  {
    category: 'sea-fish-guide',
    slug: 'bhetki-vs-pomfret-vs-parshe',
    title: 'Bhetki vs Pomfret vs Parshe: Which Fish Should You Buy?',
    excerpt: 'Three Sundarban favourites, three very different fish. Compare taste, texture, bones and best cooking methods.',
    photo: 'parshe',
    tags: ['bhetki', 'pomfret', 'parshe', 'fish comparison'],
    meta_title: 'Bhetki vs Pomfret vs Parshe – Taste, Bones & Cooking',
    meta_description: 'Compare bhetki, rupchanda and parshe fish: flavour, texture, bones, price and the best recipes for each.',
    content: `<p>Not sure which fish to order this week? Here is a quick comparison of three customer favourites.</p>
<h2>Bhetki (sea bass)</h2><ul><li><strong>Taste:</strong> mild and clean</li><li><strong>Texture:</strong> thick, firm white fillets</li><li><strong>Bones:</strong> very few</li><li><strong>Best for:</strong> fish fry, paturi, grilled fillets</li></ul>
<h2>Silver pomfret (rupchanda)</h2><ul><li><strong>Taste:</strong> sweet and delicate</li><li><strong>Texture:</strong> soft and flaky</li><li><strong>Bones:</strong> one central bone, easy to eat</li><li><strong>Best for:</strong> whole fry, curry, tandoori</li></ul>
<h2>Parshe (gold-spot mullet)</h2><ul><li><strong>Taste:</strong> sweet with a light river flavour</li><li><strong>Texture:</strong> tender</li><li><strong>Bones:</strong> small bones</li><li><strong>Best for:</strong> light jhol with vegetables, crispy fry</li></ul>
<h3>Our recommendation</h3><p>Families with children love bhetki for its boneless fillets. For a special dinner, rupchanda fry is hard to beat. And for an everyday homestyle meal, nothing beats parshe jhol.</p>
${shopLink}`,
  },

  // Healthy Recipes
  {
    category: 'healthy-recipes',
    slug: 'shorshe-ilish-recipe',
    title: 'Authentic Shorshe Ilish Recipe (Hilsa in Mustard Sauce)',
    excerpt: 'The king of Bengali dishes, made the traditional way with fresh hilsa, mustard paste, green chilli and mustard oil.',
    photo: 'hilsa',
    tags: ['recipe', 'hilsa', 'shorshe ilish', 'bengali food'],
    featured: true,
    meta_title: 'Shorshe Ilish Recipe – Traditional Hilsa in Mustard Sauce',
    meta_description: 'Step-by-step shorshe ilish recipe: fresh hilsa cooked in mustard paste, green chillies and mustard oil. Ready in 30 minutes.',
    content: `<p>Shorshe ilish is the dish every Bangladeshi family waits for in monsoon. It's simple, quick and all about the quality of the fish.</p>
<h2>Ingredients (serves 4)</h2><ul><li>4–6 pieces of fresh hilsa</li><li>3 tbsp yellow and black mustard seeds</li><li>4–5 green chillies</li><li>½ tsp turmeric</li><li>4 tbsp mustard oil</li><li>Salt to taste</li></ul>
<h2>Method</h2><ol><li>Soak the mustard seeds for 15 minutes, then grind with two green chillies and a pinch of salt into a smooth paste.</li><li>Rub the fish with salt and turmeric.</li><li>Mix the mustard paste with half a cup of water, turmeric and two tablespoons of mustard oil.</li><li>Place the fish in a pan, pour the sauce over and add slit green chillies.</li><li>Cover and cook on low heat for 10–12 minutes. Do not stir — gently shake the pan instead.</li><li>Finish with a drizzle of raw mustard oil.</li></ol>
<h3>Tips</h3><ul><li>Bitter mustard paste? Grind it briefly and avoid over-blending.</li><li>For bhapa ilish, steam the same mixture in a covered bowl for 15 minutes.</li></ul>
${shopLink}`,
  },
  {
    category: 'healthy-recipes',
    slug: 'honey-lemon-ginger-tea-recipe',
    title: 'Honey Lemon Ginger Tea: The Perfect Cold-Weather Drink',
    excerpt: 'A warming three-ingredient tea that soothes the throat and boosts immunity. Ready in five minutes.',
    photo: 'khalisha',
    tags: ['recipe', 'honey', 'ginger tea', 'immunity'],
    meta_title: 'Honey Lemon Ginger Tea Recipe – Natural Immunity Booster',
    meta_description: 'Make soothing honey lemon ginger tea in 5 minutes. A natural remedy for sore throat and cold, with raw Sundarban honey.',
    content: `<p>When the weather changes, this simple tea is the first thing many families in Bangladesh reach for.</p>
<h2>Ingredients</h2><ul><li>1 cup water</li><li>1 inch fresh ginger, sliced</li><li>1 tsp raw honey</li><li>½ lemon</li><li>Optional: a few tulsi leaves or a pinch of black pepper</li></ul>
<h2>Method</h2><ol><li>Boil the water with ginger for 3–4 minutes.</li><li>Strain into a cup and let it cool for a minute.</li><li>Squeeze in the lemon and stir in the honey.</li></ol>
<h2>Why it works</h2><ul><li><strong>Ginger</strong> warms the body and helps digestion.</li><li><strong>Lemon</strong> adds vitamin C.</li><li><strong>Honey</strong> coats and soothes the throat.</li></ul>
<h3>Tip</h3><p>Always add honey after the water has cooled slightly. Boiling honey destroys its natural enzymes.</p>
${shopLink}`,
  },
  {
    category: 'healthy-recipes',
    slug: 'crispy-bhetki-fish-fry-recipe',
    title: 'Crispy Bhetki Fish Fry (Kolkata-Style Recipe)',
    excerpt: 'Golden, crunchy bhetki fillets marinated in ginger, garlic and green chilli. A restaurant classic you can make at home.',
    photo: 'bhetki',
    tags: ['recipe', 'bhetki', 'fish fry'],
    meta_title: 'Bhetki Fish Fry Recipe – Crispy Kolkata-Style Fillets',
    meta_description: 'How to make crispy bhetki fish fry at home: marinade, breadcrumb coating and frying tips for perfect golden fillets.',
    content: `<p>Bhetki's thick, boneless fillets are perfect for a crispy fish fry. Serve it with kasundi and onion salad.</p>
<h2>Ingredients</h2><ul><li>500 g bhetki fillets</li><li>1 tbsp ginger-garlic paste</li><li>2 green chillies and a handful of coriander, ground</li><li>Juice of 1 lemon, salt and pepper</li><li>2 eggs, beaten</li><li>1 cup breadcrumbs</li><li>Oil for frying</li></ul>
<h2>Method</h2><ol><li>Cut the fillets into flat pieces and marinate with ginger-garlic, chilli-coriander paste, lemon, salt and pepper for 30 minutes.</li><li>Dip each piece in egg, then press firmly into breadcrumbs. Repeat for an extra-crispy coat.</li><li>Rest in the fridge for 15 minutes so the coating sets.</li><li>Fry in medium-hot oil for 3–4 minutes per side until golden.</li></ol>
<h3>Healthier option</h3><p>Brush with oil and bake at 200°C for 18–20 minutes, turning once.</p>
${shopLink}`,
  },
  {
    category: 'healthy-recipes',
    slug: 'rupchanda-pomfret-curry-recipe',
    title: 'Rupchanda Curry: Simple Pomfret Curry for Everyday Meals',
    excerpt: 'Soft silver pomfret in a light tomato and onion gravy. Mild enough for kids, tasty enough for guests.',
    photo: 'pomfret',
    tags: ['recipe', 'pomfret', 'rupchanda', 'fish curry'],
    meta_title: 'Rupchanda (Pomfret) Curry Recipe – Easy Bangladeshi Style',
    meta_description: 'An easy Bangladeshi rupchanda curry with tomato, onion and spices. Ready in 35 minutes with fresh silver pomfret.',
    content: `<p>Rupchanda's sweet, soft flesh makes it perfect for a light homestyle curry.</p>
<h2>Ingredients</h2><ul><li>4 medium pomfrets, cleaned and scored</li><li>2 onions, finely sliced</li><li>2 tomatoes, chopped</li><li>1 tsp each ginger and garlic paste</li><li>½ tsp turmeric, 1 tsp chilli powder, 1 tsp cumin powder</li><li>3 tbsp oil, salt, coriander leaves</li></ul>
<h2>Method</h2><ol><li>Rub the fish with salt and turmeric and lightly fry on both sides. Set aside.</li><li>In the same oil, fry onions until golden.</li><li>Add ginger, garlic and spices with a splash of water; cook until the oil separates.</li><li>Add tomatoes and cook until soft.</li><li>Pour in one cup of water, bring to a boil and gently add the fish.</li><li>Simmer for 8–10 minutes and finish with coriander.</li></ol>
${shopLink}`,
  },

  // Sundarbans Stories
  {
    category: 'sundarbans-stories',
    slug: 'moual-honey-hunters-of-the-sundarbans',
    title: 'The Moual Honey Hunters of the Sundarbans',
    excerpt: 'Every April, brave Moual collectors enter the mangrove forest to harvest wild honey. This is their story.',
    photo: 'goran',
    tags: ['sundarbans', 'moual', 'honey hunting', 'wild honey'],
    featured: true,
    meta_title: 'Moual Honey Hunters of the Sundarbans – How Wild Honey Is Collected',
    meta_description: 'Meet the Moual honey hunters of the Sundarbans and learn how wild mangrove honey is collected sustainably each spring.',
    content: `<p>Deep inside the Sundarbans, the world's largest mangrove forest, lives a community whose livelihood depends on wild bees: the Mouals.</p>
<h2>The honey season</h2><p>The official honey season begins on 1 April, when the forest department issues permits. Groups of 7–10 Mouals travel by boat into the forest for two to three weeks.</p>
<h2>A dangerous job</h2><p>The Sundarbans is home to the Royal Bengal Tiger. Mouals work in groups, carry no weapons and rely on generations of knowledge to stay safe.</p>
<h2>How the honey is collected</h2><ol><li>Collectors spot bees flying back to their hive.</li><li>A bundle of leaves is lit to create smoke, which calms the bees.</li><li>Only the honey-filled part of the comb is cut; the brood section is left so the colony can recover.</li><li>Honey is squeezed by hand into clean containers.</li></ol>
<h2>Sustainable harvesting</h2><p>Leaving part of the hive behind is the most important rule. It keeps the bee population healthy for the next season.</p>
<h3>From the forest to your home</h3><p>Mangrove Collection works directly with Moual families, paying fair prices and bringing their raw honey straight to you.</p>
${shopLink}`,
  },
  {
    category: 'sundarbans-stories',
    slug: 'khalisha-goran-keora-sundarban-honey-types',
    title: 'Khalisha, Goran and Keora: The Types of Sundarban Honey',
    excerpt: 'Sundarban honey changes with the flowers. Learn the difference between Khalisha, Goran, Keora and Bain honey.',
    photo: 'khalisha',
    tags: ['khalisha honey', 'goran honey', 'sundarban honey'],
    meta_title: 'Types of Sundarban Honey – Khalisha, Goran, Keora & Bain',
    meta_description: 'Compare the four main types of Sundarban mangrove honey: colour, taste, season and best uses of Khalisha, Goran, Keora and Bain.',
    content: `<p>The taste and colour of Sundarban honey depend on which mangrove trees are in bloom. Here are the four main varieties.</p>
<h2>Khalisha honey</h2><p>Harvested in early April, Khalisha is light golden with a delicate floral flavour. It is considered the finest and most expensive Sundarban honey.</p>
<h2>Goran honey</h2><p>Goran flowers produce a darker amber honey with a stronger, slightly bitter-sweet taste and high mineral content.</p>
<h2>Keora honey</h2><p>Collected later in the season, Keora honey is thin, slightly sour and quick to crystallise.</p>
<h2>Bain honey</h2><p>Bain honey is reddish and thick with an earthy flavour.</p>
<h2>Which one should you choose?</h2><ul><li><strong>For tea and everyday use:</strong> Khalisha</li><li><strong>For health remedies:</strong> Goran</li><li><strong>For cooking and baking:</strong> Keora or Bain</li></ul>
${shopLink}`,
  },
  {
    category: 'sundarbans-stories',
    slug: 'life-of-sundarban-fishermen',
    title: 'A Day in the Life of Sundarban Fishermen',
    excerpt: 'Before sunrise, small wooden boats leave the river villages. Follow a day with the fishermen who bring you fresh fish.',
    photo: 'parshe',
    tags: ['sundarbans', 'fishermen', 'fresh fish'],
    meta_title: 'Life of Sundarban Fishermen – Where Your Fresh Fish Comes From',
    meta_description: 'Follow a day in the life of Sundarban fishermen, from pre-dawn nets to the ice boxes that keep fish fresh.',
    content: `<p>Villages along the Pasur and Shibsa rivers wake up before dawn. For thousands of families, fishing is the only way of life.</p>
<h2>Before sunrise</h2><p>By 4 a.m., the boats are on the water. Nets set the evening before are pulled in by hand.</p>
<h2>The catch</h2><p>Depending on the season, the nets bring parshe, bhetki, tengra, shrimp and crab. In monsoon, the lucky ones find hilsa.</p>
<h2>Keeping it fresh</h2><p>Fish are sorted on the boat and packed in ice within hours, then taken to the landing centre in Khulna.</p>
<h2>Challenges</h2><ul><li>Cyclones and rising salinity</li><li>Seasonal fishing bans to protect breeding</li><li>Middlemen who take most of the profit</li></ul>
<h3>Fair trade, fresher fish</h3><p>By buying directly from fishing communities, we pay fishermen better and get fish to your table faster.</p>
${shopLink}`,
  },
  {
    category: 'sundarbans-stories',
    slug: 'why-mangrove-forests-matter',
    title: 'Why Mangrove Forests Matter for Our Food and Future',
    excerpt: 'The Sundarbans protects millions of people from storms and feeds the fish and bees we depend on. Here is why it matters.',
    photo: 'bhetki',
    tags: ['mangrove', 'sundarbans', 'environment', 'sustainability'],
    meta_title: 'Why Mangrove Forests Matter – The Sundarbans and Our Food',
    meta_description: 'Learn how the Sundarbans mangrove forest protects coasts, stores carbon and supports the honey and fish we eat.',
    content: `<p>The Sundarbans, a UNESCO World Heritage Site, covers about 10,000 square kilometres across Bangladesh and India.</p>
<h2>A natural shield</h2><p>Mangrove roots slow down storm surges and protect coastal villages during cyclones like Sidr and Amphan.</p>
<h2>A nursery for fish</h2><p>Many sea fish spend their early life among mangrove roots before moving into the Bay of Bengal.</p>
<h2>Home of wild bees</h2><p>Mangrove flowers feed the giant rock bees that produce Sundarban honey.</p>
<h2>Carbon storage</h2><p>Mangroves store up to four times more carbon than tropical rainforests.</p>
<h2>How you can help</h2><ul><li>Buy from sellers who support sustainable harvesting</li><li>Avoid fish during breeding bans</li><li>Support mangrove restoration projects</li></ul>
${shopLink}`,
  },

  // Buying & Storage Guide
  {
    category: 'buying-storage-guide',
    slug: 'why-honey-crystallizes',
    title: 'Why Does Honey Crystallise? (And How to Fix It)',
    excerpt: 'Crystallised honey is not spoiled — it is a sign of pure honey. Learn why it happens and how to make it runny again.',
    photo: 'goran',
    tags: ['honey storage', 'crystallised honey', 'pure honey'],
    meta_title: 'Why Honey Crystallises & How to Decrystallise It Safely',
    meta_description: 'Crystallised honey is natural. Learn why raw honey turns solid in winter and the safe way to make it liquid again.',
    content: `<p>Many customers ask us in winter: "My honey turned solid — is it fake?" The answer is no. Crystallisation is natural.</p>
<h2>Why it happens</h2><p>Honey is a supersaturated mix of glucose and fructose. Glucose separates from water and forms crystals, especially below 15°C.</p>
<h2>Which honey crystallises faster?</h2><ul><li>Honey high in glucose, such as Keora</li><li>Raw honey with pollen particles</li><li>Honey stored in a cold place</li></ul>
<h2>How to make it liquid again</h2><ol><li>Place the closed jar in a bowl of warm water (about 40°C).</li><li>Leave for 15–20 minutes, stirring occasionally.</li><li>Never microwave or boil honey — it destroys its enzymes.</li></ol>
<h2>Storage tips</h2><ul><li>Keep in a glass jar with a tight lid</li><li>Store at room temperature, away from sunlight</li><li>Always use a dry spoon</li></ul>
${shopLink}`,
  },
  {
    category: 'buying-storage-guide',
    slug: 'how-to-store-and-freeze-fish',
    title: 'How to Store and Freeze Fresh Fish the Right Way',
    excerpt: 'Proper cleaning, drying and packing keep fish tasting fresh for months. A practical guide for home freezers.',
    photo: 'pomfret',
    tags: ['fish storage', 'freezing fish', 'kitchen tips'],
    meta_title: 'How to Freeze Fish at Home – Keep It Fresh for Months',
    meta_description: 'Step-by-step guide to cleaning, packing and freezing fresh fish at home, plus how to thaw it safely.',
    content: `<p>Buying fish in bulk saves money — as long as you store it correctly.</p>
<h2>Step 1: Clean quickly</h2><p>Scale, gut and wash the fish as soon as it arrives. Remove the blood line along the spine, which spoils first.</p>
<h2>Step 2: Dry thoroughly</h2><p>Pat dry with a clean cloth or kitchen paper. Extra water forms ice crystals and ruins the texture.</p>
<h2>Step 3: Portion and pack</h2><ul><li>Pack one meal's worth per bag</li><li>Squeeze out all the air</li><li>Label with the date and type of fish</li></ul>
<h2>Step 4: Freeze fast</h2><p>Lay bags flat in the coldest part of the freezer.</p>
<h2>How long does fish last?</h2><ul><li>Fridge: 1–2 days</li><li>Freezer (oily fish like hilsa): up to 3 months</li><li>Freezer (white fish like bhetki): up to 6 months</li></ul>
<h2>Thawing</h2><p>Thaw overnight in the fridge, never at room temperature.</p>
${shopLink}`,
  },
  {
    category: 'buying-storage-guide',
    slug: 'buying-natural-food-online-bangladesh',
    title: 'Buying Natural Food Online in Bangladesh: What to Check',
    excerpt: 'Online shopping for honey and fish is convenient, but not every seller is honest. Use this checklist before you order.',
    photo: 'hilsa',
    tags: ['online shopping', 'natural food', 'bangladesh'],
    meta_title: 'Buying Honey & Fish Online in Bangladesh – 7-Point Checklist',
    meta_description: 'A practical checklist for buying natural honey and fresh fish online in Bangladesh: sourcing, delivery, payment and returns.',
    content: `<p>More families in Dhaka, Chattogram and beyond now order natural food online. Here's how to choose a trustworthy seller.</p>
<h2>1. Clear sourcing</h2><p>A good seller tells you exactly where the product comes from — which forest, which river, which season.</p>
<h2>2. Real photos and reviews</h2><p>Look for real product photos and verified customer reviews.</p>
<h2>3. Cold-chain delivery for fish</h2><p>Fish must arrive on ice in insulated packaging.</p>
<h2>4. Cash on delivery</h2><p>Cash on delivery lets you check the product before paying.</p>
<h2>5. Secure mobile payments</h2><p>bKash, Nagad and Rocket payments should be confirmed with a transaction ID.</p>
<h2>6. Order tracking</h2><p>You should be able to track your order status easily.</p>
<h2>7. Responsive support</h2><p>A WhatsApp or Messenger contact makes it easy to ask questions before and after buying.</p>
${shopLink}`,
  },
  {
    category: 'buying-storage-guide',
    slug: 'honey-gift-ideas-for-eid-and-weddings',
    title: 'Natural Honey Gift Ideas for Eid, Weddings and Festivals',
    excerpt: 'Looking for a healthy, meaningful gift? Natural Sundarban honey makes a thoughtful present for every occasion.',
    photo: 'khalisha',
    tags: ['gift ideas', 'eid gift', 'honey gift'],
    meta_title: 'Honey Gift Ideas for Eid & Weddings – Healthy Gifts in Bangladesh',
    meta_description: 'Healthy gift ideas with natural Sundarban honey for Eid, weddings, Pohela Boishakh and corporate gifting.',
    content: `<p>Sweets are traditional gifts in Bangladesh, but more people now choose healthier options. Pure honey is perfect.</p>
<h2>Why honey makes a great gift</h2><ul><li>Healthy and loved by all ages</li><li>Long shelf life — it never really spoils</li><li>Looks premium in a glass jar</li></ul>
<h2>Gift ideas</h2><ol><li><strong>Honey duo:</strong> one Khalisha and one Goran jar to compare flavours.</li><li><strong>Wellness hamper:</strong> honey, ginger, lemon and a mug.</li><li><strong>Wedding favours:</strong> small honey jars with a personal tag.</li><li><strong>Corporate gifts:</strong> branded honey boxes for clients and staff.</li></ol>
<h2>Gifting tips</h2><ul><li>Order early before Eid when delivery is busy</li><li>Add a note explaining where the honey comes from</li><li>Choose 500 g jars for individuals and 1 kg for families</li></ul>
${shopLink}`,
  },
]

async function storeCover(photo: Photo, adminId: bigint | null): Promise<string> {
  const file = PHOTOS[photo]
  const jpeg = await sharp(await readFile(join(paths.seedImages, 'products', file)))
    .resize(COVER.width, COVER.height, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82 })
    .toBuffer()

  const now = new Date()
  const path = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/blog-${photo}-${randomLower(8)}.jpg`
  await storage.put('public', path, jpeg)
  await prisma.media.create({ data: { disk: 'public', path, original_name: file, mime_type: 'image/jpeg', size: jpeg.length, uploaded_by: adminId } })
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

const missing = []
for (const post of POSTS) if (!(await prisma.blogPost.findUnique({ where: { slug: post.slug }, select: { id: true } }))) missing.push(post)

const covers = new Map<Photo, string>()
for (const photo of new Set(missing.map((post) => post.photo))) covers.set(photo, await storeCover(photo, adminId))

const DAY = 86_400_000
const today = Math.floor(Date.now() / 1000) * 1000

for (const [index, post] of POSTS.entries()) {
  if (!missing.includes(post)) {
    console.log(`  Skipped ${post.title} (already exists)`)
    continue
  }

  const { category, photo, featured, ...fields } = post
  await prisma.blogPost.create({
    data: {
      ...fields,
      content: fields.content.replace(/\n/g, ''),
      blog_category_id: categories.get(category)!,
      author_id: adminId,
      cover_image: covers.get(photo)!,
      status: 'published',
      is_featured: featured ?? false,
      // Spread over the last weeks so "latest" ordering looks natural.
      published_at: new Date(today - (POSTS.length - index) * 2 * DAY),
    },
  })
  console.log(`  Created ${post.title}`)
}

await prisma.$disconnect()
