/**
 * Environmental Futures Archive - Client Scripts
 * Handles:
 * 1. Email contact obfuscation
 * 2. Stories list pagination & rendering (with 30 sample stories for review)
 * 3. Single story view rendering from URL param (?id=...)
 * 4. Submit form validation, live word counter, unsaved warnings, and submission handling
 */

// -------------------------------------------------------------
// Sample Stories Dataset (30 stories for testing §10 & §11)
// -------------------------------------------------------------
const SAMPLE_STORIES = [
  {
    id: "the-seed-vault-at-solstice",
    title: "The Seed Vault at Solstice",
    author: "Elena Rostova",
    anonymous: false,
    institution: "University of Edinburgh",
    bio: "Elena Rostova studies plant ecology and northern agroforestry.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Every solstice, the refrigeration pipes hum at a lower register. The permafrost that once cradled the vault has long given way to bedrock anchored with geothermal pins, but inside, forty million varieties of barley and lichen remain dormant at eighteen degrees below zero.

I walk between the aluminum rows checking humidity sensors. Outside, the Svalbard coast is green with dwarf willow and tall grasses that our great-grandparents only cataloged in southern valleys. The terns arrive three weeks earlier than the old field guides predicted.

We do not open the envelopes often. Only when a district along the Ob basin or the St. Lawrence river asks for a lost blight-resistant grain do we withdraw a vial, label it in carbon ink, and prepare it for the electric freighter.

People imagine that an archive is a cemetery. In truth, it is an engine waiting for the right spring.`
  },
  {
    id: "whispers-of-the-canopy-towers",
    title: "Whispers of the Canopy Towers",
    author: "Anonymous",
    anonymous: true,
    institution: "McGill University",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The old highway was decommissioned in 2074. By the time I was born, the asphalt had fractured beneath the roots of black walnut and cedar, forming a tiered terrace of ferns and wild onion.

We live in the canopy towers now—slender timber structures woven from cross-laminated larch that sway gently with the ridge winds. In the early morning, mist fills the valley below us like a silver lake. The sensor arrays chime softly when the air quality index peaks above fifty, signaling the solar blinds to extend.

You can hear thrushes nesting in the solar armature. They have learned to mimic the frequency of the water pumps.`
  },
  {
    id: "the-tide-weavers-of-new-haven",
    title: "The Tide Weavers of New Haven",
    author: "Marcus Chen",
    anonymous: false,
    institution: "Yale University",
    bio: "Marcus is an undergraduate in architecture focusing on coastal flood mitigation.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `When high tide arrives, Long Island Sound slips past the breakwaters into Chapel Street. It is no longer considered an emergency; it is simply eleven in the morning.

We build with salt-marsh cordgrass composites and oyster reef encasements that strengthen under tidal pressure. The ground floors of our libraries are open stone colonnades where crabs skitter between granite plinths. Books have long migrated to the dry upper galleries.

"Listen," my advisor says, leaning over the balustrade. Beneath the surface, the juvenile striped bass feed between the living pilings. We did not hold back the sea with concrete dykes. We made room for the water to breathe.`
  },
  {
    id: "chlorophyll-skyline",
    title: "Chlorophyll Skyline",
    author: "Amina Al-Mansoor",
    anonymous: false,
    institution: "University of Toronto",
    bio: "Amina writes speculative fiction exploring urban agriculture.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `From fifty stories up, Toronto looks less like a city of glass and more like a vertical wetland. The exterior membranes of our towers are coated in photosynthetic algae cultures that produce hydrogen while filtering particulate haze.

The street level belongs to shade gardens, fungi beds, and the electric tramway. We commute via suspended gondolas that hum along magnetic cables, threading through living canopies of silver maple and hackberry.

Sometimes, in late October, a flock of migrating geese will settle right upon the algal collectors of the south terrace, mistaking the warm green sheen for an estuary. We let them rest until dawn.`
  },
  {
    id: "the-glass-monitors-of-lake-erie",
    title: "The Glass Monitors of Lake Erie",
    author: "Samuel Vance-Holloway",
    anonymous: false,
    institution: "Oberlin College",
    bio: "Samuel studies freshwater biology.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The autonomous skiffs glide through the western basin without wake. Every six minutes, an internal laser spectrophotometer samples the water column for micro-cystin and dissolved oxygen.

Lake Erie is clearer now than it was during the mid-twentieth century, though its currents are warmer and slower. Zebra mussels were replaced fifty years ago by bio-engineered native bivalves that bind phosphorus into insoluble shells.

I watch the telemetry stream from the stone pier at Marblehead. A century ago, this water burned or turned the color of pea soup each August. Today, schools of walleye shimmer beneath the pier light, hunting mayfly nymphs that hatch in numbers our textbooks call miraculous.`
  },
  {
    id: "the-fog-catchers-of-atacama",
    title: "The Fog Catchers of Atacama",
    author: "Camila Ruiz",
    anonymous: false,
    institution: "Pontificia Universidad Católica de Chile",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `At six thousand feet above the Pacific, the camanchaca mist arrives like a silent wall. The nets stand thirty meters high, woven from recycled polyolefin fibers that grab the airborne droplets and channel them down gravity pipes into stone cisterns.

In the valley below, our olive groves and drought-tolerant carob trees have flourished for four generations. The desert remains severe and silent, but where the water channels run, wild thyme and desert lupines turn the gravel purple.

Our elders remember when water arrived only in diesel tank trucks. Now the sky gives it freely every midnight.`
  },
  {
    id: "a-hundred-winters-of-moss",
    title: "A Hundred Winters of Moss",
    author: "Anonymous",
    anonymous: true,
    institution: "University of Washington",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Snow rarely stays in the Cascades past February now. Instead, we have the moss season—nine months of perpetual drizzle and temperate air that has turned the cedar forests into emerald sponges.

The old ski chalets have been converted into regional watershed laboratories. We measure soil respiration and fungal network speeds. The trees do not grow taller, but they are denser, bound together by subterranean networks of mycorrhizae that survive summer heat waves by sharing moisture across whole mountain valleys.`
  },
  {
    id: "the-quiet-corrals",
    title: "The Quiet Corrals",
    author: "Daisuke Takahashi",
    anonymous: false,
    institution: "Kyoto University",
    bio: "Daisuke Takahashi is a fourth-year student in environmental sociology.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The solar farms in northern Hokkaido are quiet. Between the bifacial photovoltaic panels, sheep graze on native clover and sweetgrass, keeping the grass below the panel bevels without gas mowers.

The wolves that were reintroduced in the 2080s stay high on the forested ridges, but their presence has kept the deer from overgrazing the riverbanks. The aspen have returned to the creek beds, and with them, beavers whose dams have restored three hundred acres of silt wetlands.

Looking out over the valley, the blue tint of the silicon panels blends with the sky like a second river.`
  },
  {
    id: "the-salt-gardeners-of-the-delta",
    title: "The Salt Gardeners of the Delta",
    author: "Fatima Noor",
    anonymous: false,
    institution: "University of Dhaka",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The southern coast of Bangladesh is now a living mangrove archipelago. Instead of building stone seawalls that collapse in monsoons, we plant sundari and gewa trees in interlocking triangular formations that break tidal surges before they reach our floating homesteads.

Our houses rise and fall on bamboo pontoons filled with recycled aerogels. When the cyclones come, we do not flee inland; we tether our homes together like an armada of green islands and let the storm ride over the flexible canopies.

Under the pontoons, crabs and tiger prawns find shelter. The river and the sea have become one, and so have we.`
  },
  {
    id: "re-greening-the-sunken-pit",
    title: "Re-greening the Sunken Pit",
    author: "Jordan Miller",
    anonymous: false,
    institution: "Curtin University",
    bio: "Jordan studies mining rehabilitation and arid landscape repair.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The Super Pit gold mine in Kalgoorlie is three kilometers long and four hundred meters deep. When the ore was exhausted, they filled the base with treated municipal water and planted hyperaccumulating acacia along the spiral haul roads.

Today, standing at the rim, you look down into a subterranean rainforest. The steep terracotta cliffs trap cool air and morning fog, creating a microclimate where tree ferns and flowering mulga flourish in the red desert interior.

From space, it looks like a giant green pupil watching the sun.`
  },
  {
    id: "the-last-combustion-museum",
    title: "The Last Combustion Museum",
    author: "Liam O'Connor",
    anonymous: false,
    institution: "Trinity College Dublin",
    bio: "Liam writes essays on technological transitions.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Inside the glass pavilion in Phoenix Park, an antique eight-cylinder engine sits on a pedestal of polished limestone. Once a week, the curator starts it for sixty seconds.

Visitors step back, startled by the violent rattle, the acrid bite of unburned hydrocarbons, the sudden burst of heat. Children ask why people tolerated sitting on top of explosions to travel to the market.

Outside, the electric mag-rail glides past in absolute silence, powered by the offshore wave generators in Galway Bay.`
  },
  {
    id: "songlines-of-the-reclaimed-grid",
    title: "Songlines of the Reclaimed Grid",
    author: "Anonymous",
    anonymous: true,
    institution: "Australian National University",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The high-voltage transmission corridors across the Great Dividing Range have been converted into continuous wildlife highways. Beneath the decommissioned pylons, native eucalyptus corridors allow koalas and wallabies to move north as seasonal heat waves shift.

Rangers manage the corridors with traditional fire-stick cultural burns every autumn, clearing the underbrush and triggering the germination of banksia pods. The steel towers remain as raptor roosts, where wedge-tailed eagles nest fifty meters above the canopy.`
  },
  {
    id: "the-kelp-weavers-of-monterey",
    title: "The Kelp Weavers of Monterey",
    author: "Sophia Alvarez",
    anonymous: false,
    institution: "UC Santa Cruz",
    bio: "Sophia is an undergraduate marine scientist.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Giant bladder kelp grows two feet a day in the cool upwellings off Cannery Row. We harvest only the upper canopy, leaving the holdfasts intact to anchor the otters and harbor seals that sleep wrapped in the fronds.

The harvested kelp is dried in solar kilns on the wharf and pressed into construction timber and biodegradable packaging. The bay smells of salt and ozone, exactly as John Steinbeck described it, but the water is clear down to seventy feet.`
  },
  {
    id: "the-rooftop-apiaries-of-lyon",
    title: "The Rooftop Apiaries of Lyon",
    author: "Julien Mercier",
    anonymous: false,
    institution: "Université de Lyon",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Between the Saône and the Rhône, every slate roof in Lyon has been replaced by wild lavender, rosemary, and sedum. The bees produce dark, herbal honey that tastes faintly of limestone and thyme.

Pesticides have been absent from French agriculture for sixty years. In the evenings, swifts and bats hunt insects in the warm thermal currents above the terracotta chimneys.`
  },
  {
    id: "the-floating-orchards-of-rotterdam",
    title: "The Floating Orchards of Rotterdam",
    author: "Anouk van Dijk",
    anonymous: false,
    institution: "TU Delft",
    bio: "Anouk is studying hydraulic engineering and circular bio-design.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `In the old harbor basins of Rotterdam, thirty floating orchards bob on tidal pontoons. Apple and pear trees are anchored in lightweight expanded clay, their roots irrigated by desalinated brackish water purified by solar distillers.

The port that once offloaded millions of tons of coal now produces eight hundred tons of crisp winter apples and twenty megawatts of tidal energy each season.`
  },
  {
    id: "the-stone-terraces-of-yunnan",
    title: "The Stone Terraces of Yunnan",
    author: "Li Wei",
    anonymous: false,
    institution: "Tsinghua University",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The ancient Hani rice terraces have stood for thirteen centuries. Today, they are augmented by micro-hydro channels carved into the native slate that power the village clinics without disrupting the fish that spawn in the flooded paddies.

Rice varieties developed here tolerate forty-degree summers and sudden autumn chills. When the sun sets behind the Ailao Mountains, the terraces reflect the red sky like hundreds of curved mirrors.`
  },
  {
    id: "the-peat-keepers-of-the-bog",
    title: "The Peat Keepers of the Bog",
    author: "Ciaran Murphy",
    anonymous: false,
    institution: "University College Cork",
    bio: "Ciaran Murphy is a geography student researching carbon sequestration in raised bogs.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The ditch blockers work through the November rain. By driving treated larch stakes into the old drainage cuts, we have re-wetted twenty thousand hectares of raised bog across the Irish midlands.

Sphagnum moss is spreading again across the black peat, holding twenty times its weight in fresh water. Snipe and curlews, once on the brink of extinction, probe the spongy tussocks for dragonflies. The bog is our largest carbon vault, silent and soaking beneath the Atlantic gale.`
  },
  {
    id: "the-lichen-painters-of-reykjavik",
    title: "The Lichen Painters of Reykjavik",
    author: "Brynja Sigurðardóttir",
    anonymous: false,
    institution: "University of Iceland",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `On the basalt lava fields outside Reykjavik, we spray a mixture of buttermilk and powdered crustose lichen spores onto the bare volcanic rock. Within three rainy seasons, yellow and grey circles expand across the basalt, breaking minerals into soil that can support arctic birch.

The geothermal steam from the valley below keeps our glasshouses warm year-round, producing oranges and barley within fifty miles of the Arctic Circle.`
  },
  {
    id: "the-dune-anchors-of-dunhuang",
    title: "The Dune Anchors of Dunhuang",
    author: "Zhao Lin",
    anonymous: false,
    institution: "Lanzhou University",
    bio: "Zhao Lin is a researcher in desert reclamation.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The Great Green Wall around the Gobi Desert is no longer a uniform monoculture of poplars that died of beetle infestation. We use straw checkerboards pressed into the sand dunes, interspersed with drought-resistant saxaul shrubs whose roots reach deep into the subterranean aquifers.

The Mogao Caves are safe from sand drift. For sixty kilometers along the old Silk Road, wild gazelles graze on desert scrub where dust storms once blotted out the midday sun.`
  },
  {
    id: "the-river-that-learned-to-sleep",
    title: "The River That Learned to Sleep",
    author: "Anonymous",
    anonymous: true,
    institution: "University of Montana",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The Clark Fork river runs through our valley without concrete levees. When the spring snowmelt comes down from the Bitterroot Range, the river spills into designated cottonwood floodplains, dropping rich silt and feeding beaver wetlands before returning gently to its summer channel.

We built our homes on the terrace benches above the floodplain. In June, you can hear the river spreading out through the gravel bars, whispering through the willow thickets like an animal finding a comfortable bed.`
  },
  {
    id: "the-bamboo-cathedrals",
    title: "The Bamboo Cathedrals",
    author: "Maya Patel",
    anonymous: false,
    institution: "IIT Bombay",
    bio: "Maya Patel studies structural bamboo composites and vernacular engineering.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The high-speed rail stations across the Konkan coast are built entirely of Guadua bamboo arches treated with borax and joined with hemp fiber cordage. The structures are earthquake-resistant, carbon-negative, and last for a century.

During the monsoon, rainwater cascading down the hyperbolic roofs is funneled into stepwells that feed urban orchards. The air inside smells of cedar and sweet earth.`
  },
  {
    id: "the-ice-stupa-builders-of-ladakh",
    title: "The Ice Stupa Builders of Ladakh",
    author: "Stanzin Norbu",
    anonymous: false,
    institution: "University of Jammu",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `In the freezing nights of January, we spray stream water through vertical pipes into the cold desert air. The water freezes as it falls, building fifty-meter-tall conical ice stupas that resemble frozen Buddhist shrines.

Because the stupas have a small surface area exposed to the sun, they melt slowly, releasing precious water for our barley fields in April and May when the mountain glaciers have not yet started thawing. Our ancestors started this practice; we have made it the backbone of Himalayan life.`
  },
  {
    id: "the-night-gardeners-of-seville",
    title: "The Night Gardeners of Seville",
    author: "Carlos Moreno",
    anonymous: false,
    institution: "Universidad de Sevilla",
    bio: "Carlos is an agronomy undergraduate.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `During the day, Seville rests under tensile fabric canopies that reflect eighty percent of the summer solar radiation back into space. The streets are cool tunnels where white jasmine and orange trees climb stone arches.

At night, when the Andalusian breeze blows from the Atlantic, the canopies retract. We harvest figs and melons under the moonlight, while subterranean qanats circulate cold well water beneath our courtyard tiles.`
  },
  {
    id: "the-underground-commons-of-coober-pedy",
    title: "The Underground Commons of Coober Pedy",
    author: "Kylie Henderson",
    anonymous: false,
    institution: "University of Adelaide",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Surface temperatures outside reach fifty degrees in summer, but twenty meters below the red desert earth, our library and lecture halls maintain a perpetual twenty-three degrees without air conditioning.

Fiber-optic light tubes carry natural daylight down into our sunken courtyards, illuminating vertical hydroponic lettuce farms. Above us, massive solar-thermal chimneys draw stale air out of the chambers using natural convection.`
  },
  {
    id: "the-rewilders-of-the-danube",
    title: "The Rewilders of the Danube",
    author: "Matei Ionescu",
    anonymous: false,
    institution: "University of Bucharest",
    bio: "Matei studies wetland ecology in the Danube delta.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The concrete embankments installed in the twentieth century were dismantled twenty years ago. The Danube now braids naturally across hundreds of square miles of reedbeds and willow islands.

Dalmatian pelicans nest in thousands on the floating reed mats. The sturgeon have returned from the Black Sea to spawn in the gravel shallows near the Iron Gates gorge, protected by international river agreements that prioritize biological migration over barge draft.`
  },
  {
    id: "the-sound-of-clean-wind",
    title: "The Sound of Clean Wind",
    author: "Anonymous",
    anonymous: true,
    institution: "University of Leeds",
    bio: "",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `On Ilkley Moor, the wind turbines have no gears or high-pitch whine. They are bladeless vortex generators that oscillate silently like reeds in a stream.

Standing among the purple heather, you hear only the wind itself—the rush of cool air through the gritstone boulders and the distant cry of a curlew. The air carries no soot from Leeds or Manchester. You can see the Pennine ridges thirty miles away.`
  },
  {
    id: "the-sponge-avenues-of-wuhan",
    title: "The Sponge Avenues of Wuhan",
    author: "Chen Jie",
    anonymous: false,
    institution: "Wuhan University",
    bio: "Chen Jie studies hydrological engineering and urban ecology.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Every boulevard in Wuhan is paved with porous ceramic bricks made from recycled river silt. When monsoonal downpours strike, the rainwater does not flood storm drains; it sinks directly through the pavers into subterranean gravel reservoirs that recharge the water table.

Along the Yangtze embankments, lotus ponds and bio-swales filter urban runoff before it reaches the river. In summer, the evaporation cools the entire metropolitan district by four full degrees.`
  },
  {
    id: "the-whale-road-at-cape-point",
    title: "The Whale Road at Cape Point",
    author: "Lindiwe Dlamini",
    anonymous: false,
    institution: "University of Cape Town",
    bio: "Lindiwe is a marine biology student focusing on cetacean migration.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `Commercial shipping has been routed fifty nautical miles offshore to preserve the coastal acoustic corridor. Standing on the granite cliffs of Cape Point, you can look down into the turquoise surf and see dozens of southern right whales and humpbacks breaching with their calves.

Hydrophones mounted on the navigation buoys broadcast the clicks and songs of orcas directly to our classroom radios. The ocean is quiet again.`
  },
  {
    id: "the-mycelium-sleepers",
    title: "The Mycelium Sleepers",
    author: "Jonas Lindqvist",
    anonymous: false,
    institution: "Lund University",
    bio: "Jonas studies bio-materials and sustainable railway infrastructure.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The railway ties between Stockholm and Gothenburg are grown from fungal mycelium and compressed birch chips. When a tie reaches the end of its thirty-year lifespan, it is discarded beside the tracks where it decomposes into nutrient-rich soil that feeds wild bilberries.

Passenger trains run on electric overhead wires powered by northern hydro plants. As the train cuts through the pine forests, the only trackside maintenance crew you encounter are wild reindeer grazing on the lichen beds.`
  },
  {
    id: "the-perennial-harvest",
    title: "The Perennial Harvest",
    author: "Rachel Miller",
    anonymous: false,
    institution: "Kansas State University",
    bio: "Rachel Miller studies perennial polyculture and prairie restoration.",
    prompt: "What does the environment look like in 100 years?",
    featuredArt: null,
    body: `The combine harvester glides across the Kansas prairie without plowing the soil. We harvest intermediate wheatgrass and perennial sunflowers whose roots reach three meters into the earth, holding the topsoil through dust storms and heavy deluges.

Because the fields are never tilled, the earth remains dark, moist, and packed with earthworms and deep prairie fungi. Bison graze in rotational herds on the fallow strips. The great dust bowl of the last century is a distant memory recorded only in archives like this one.`
  }
];

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  setupContactLink();
  setupHeroSlider();
  renderRecentStories();
  setupStoriesArchive();
  setupSingleStory();
  setupSubmitForm();
});

// -------------------------------------------------------------
// 1. Obfuscated Contact Link
// -------------------------------------------------------------
function setupContactLink() {
  const contactLinks = document.querySelectorAll(".contact-obfuscated");
  contactLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const user = link.getAttribute("data-user") || "archive";
      const domain = link.getAttribute("data-domain") || "environmental-futures.org";
      window.location.href = `mailto:${user}@${domain}?subject=Archive%20Inquiry`;
    });
  });
}

// -------------------------------------------------------------
// 1b. Hero Slider Logic (Philosophy World Democracy style)
// -------------------------------------------------------------
function setupHeroSlider() {
  const track = document.getElementById("hero-slider-track");
  if (!track) return;

  const slides = track.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  const captionEl = document.getElementById("hero-caption");

  if (!slides.length) return;

  let currentSlide = 0;
  let autoplayTimer = null;

  function showSlide(index) {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add("is-active");
        if (captionEl) {
          const captionText = slide.getAttribute("data-caption") || "";
          captionEl.textContent = captionText;
        }
      } else {
        slide.classList.remove("is-active");
      }
    });

    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add("is-active");
      } else {
        dot.classList.remove("is-active");
      }
    });
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 6000); // Transitions smoothly every 6 seconds
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      stopAutoplay();
      showSlide(currentSlide - 1);
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      stopAutoplay();
      showSlide(currentSlide + 1);
      startAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      stopAutoplay();
      const targetIndex = parseInt(dot.getAttribute("data-slide"), 10);
      showSlide(targetIndex);
      startAutoplay();
    });
  });

  // Pause on hover
  track.parentElement.addEventListener("mouseenter", stopAutoplay);
  track.parentElement.addEventListener("mouseleave", startAutoplay);

  // Initialize first slide and start autoplay
  showSlide(0);
  startAutoplay();
}

// -------------------------------------------------------------
// 1c. Render Recent Stories Grid (Small boxes below description)
// -------------------------------------------------------------
function renderRecentStories() {
  const gridEl = document.getElementById("recent-stories-grid");
  if (!gridEl) return;

  const stories = getArchiveStories();
  const recentStories = stories.slice(0, 3); // 3 recent stories

  gridEl.innerHTML = "";
  recentStories.forEach(story => {
    const card = document.createElement("article");
    card.className = "story-box";

    const titleH3 = document.createElement("h3");
    titleH3.className = "story-box-title";

    const link = document.createElement("a");
    link.href = `./story.html?id=${encodeURIComponent(story.id)}`;
    link.textContent = story.title;
    titleH3.appendChild(link);

    const meta = document.createElement("div");
    meta.className = "story-box-meta";
    meta.textContent = story.anonymous ? "Anonymous" : story.author;

    // First paragraph excerpt (up to 130 characters)
    const firstP = story.body.split(/\n\s*\n/)[0].trim().replace(/^>\s*/, "");
    const excerptText = firstP.length > 140 ? firstP.slice(0, 140) + "…" : firstP;

    const excerpt = document.createElement("p");
    excerpt.className = "story-box-excerpt";
    excerpt.textContent = excerptText;

    const readLink = document.createElement("a");
    readLink.className = "story-box-link";
    readLink.href = `./story.html?id=${encodeURIComponent(story.id)}`;
    readLink.textContent = "Read story →";

    card.appendChild(titleH3);
    card.appendChild(meta);
    card.appendChild(excerpt);
    card.appendChild(readLink);

    gridEl.appendChild(card);
  });
}

// -------------------------------------------------------------
// 2. Stories Archive Logic & Pagination
// -------------------------------------------------------------
function getArchiveStories() {
  // Check if any custom submissions are in localStorage to append
  let customStories = [];
  try {
    const stored = localStorage.getItem("efa_submitted_stories");
    if (stored) {
      customStories = JSON.parse(stored);
    }
  } catch (err) {
    console.error("Could not load stored stories", err);
  }
  return [...customStories, ...SAMPLE_STORIES];
}

function setupStoriesArchive() {
  const listEl = document.getElementById("stories-list");
  if (!listEl) return;

  const emptyStateEl = document.getElementById("stories-empty-state");
  const paginationNav = document.getElementById("pagination-nav");
  const prevLink = document.getElementById("prev-page");
  const nextLink = document.getElementById("next-page");
  const pageIndicator = document.getElementById("page-indicator");

  const stories = getArchiveStories();

  if (stories.length === 0) {
    listEl.style.display = "none";
    if (emptyStateEl) emptyStateEl.style.display = "block";
    if (paginationNav) paginationNav.style.display = "none";
    return;
  }

  const perPage = 20;
  const urlParams = new URLSearchParams(window.location.search);
  let currentPage = parseInt(urlParams.get("page") || "1", 10);
  const totalPages = Math.ceil(stories.length / perPage);

  if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * perPage;
  const pageStories = stories.slice(startIndex, startIndex + perPage);

  listEl.innerHTML = "";
  pageStories.forEach(story => {
    const li = document.createElement("li");
    li.className = "story-item";

    const titleH2 = document.createElement("h2");
    titleH2.className = "story-item-title";

    const a = document.createElement("a");
    a.href = `./story.html?id=${encodeURIComponent(story.id)}`;
    a.textContent = story.title;
    titleH2.appendChild(a);

    const metaP = document.createElement("p");
    metaP.className = "story-item-meta";
    metaP.textContent = story.anonymous ? "Anonymous" : story.author;

    li.appendChild(titleH2);
    li.appendChild(metaP);
    listEl.appendChild(li);
  });

  // Update pagination controls
  if (pageIndicator) {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
  }

  if (prevLink) {
    if (currentPage > 1) {
      prevLink.href = `./stories.html?page=${currentPage - 1}`;
      prevLink.removeAttribute("aria-disabled");
    } else {
      prevLink.removeAttribute("href");
      prevLink.setAttribute("aria-disabled", "true");
    }
  }

  if (nextLink) {
    if (currentPage < totalPages) {
      nextLink.href = `./stories.html?page=${currentPage + 1}`;
      nextLink.removeAttribute("aria-disabled");
    } else {
      nextLink.removeAttribute("href");
      nextLink.setAttribute("aria-disabled", "true");
    }
  }
}

// -------------------------------------------------------------
// 3. Single Story Viewer Logic
// -------------------------------------------------------------
function setupSingleStory() {
  const titleEl = document.getElementById("story-title");
  if (!titleEl) return;

  const bylineEl = document.getElementById("story-byline");
  const bodyEl = document.getElementById("story-body");
  const bioContainer = document.getElementById("author-bio-container");
  const bioText = document.getElementById("author-bio-text");
  const prevStoryLink = document.getElementById("prev-story-link");
  const nextStoryLink = document.getElementById("next-story-link");
  const prevWrapper = document.getElementById("prev-story-wrapper");
  const nextWrapper = document.getElementById("next-story-wrapper");

  const stories = getArchiveStories();
  const urlParams = new URLSearchParams(window.location.search);
  const storyId = urlParams.get("id");

  let storyIndex = stories.findIndex(s => s.id === storyId);
  if (storyIndex === -1) {
    storyIndex = 0; // Default to first story if not specified
  }

  const story = stories[storyIndex];
  if (!story) {
    titleEl.textContent = "Story not found";
    bodyEl.innerHTML = "<p>The requested story could not be located in the archive.</p>";
    return;
  }

  document.title = `${story.title} — Environmental Futures Archive`;
  titleEl.textContent = story.title;
  bylineEl.textContent = story.anonymous ? "by Anonymous" : `by ${story.author}`;

  // Preserve paragraph breaks and handle formatting
  bodyEl.innerHTML = "";
  const paragraphs = story.body.split(/\n\s*\n/);
  paragraphs.forEach(pText => {
    const trimmed = pText.trim();
    if (trimmed === "---" || trimmed === "***") {
      const hr = document.createElement("hr");
      hr.className = "scene-break";
      bodyEl.appendChild(hr);
    } else if (trimmed.startsWith(">")) {
      const bq = document.createElement("blockquote");
      bq.textContent = trimmed.replace(/^>\s*/, "");
      bodyEl.appendChild(bq);
    } else if (trimmed) {
      const p = document.createElement("p");
      p.textContent = trimmed;
      bodyEl.appendChild(p);
    }
  });

  // Author Bio
  if (!story.anonymous && story.bio && story.bio.trim()) {
    bioContainer.style.display = "block";
    bioText.textContent = story.bio;
  } else {
    bioContainer.style.display = "none";
  }

  // Navigation Links
  if (storyIndex > 0) {
    const prevStory = stories[storyIndex - 1];
    prevStoryLink.href = `./story.html?id=${encodeURIComponent(prevStory.id)}`;
  } else {
    prevWrapper.style.visibility = "hidden";
  }

  if (storyIndex < stories.length - 1) {
    const nextStory = stories[storyIndex + 1];
    nextStoryLink.href = `./story.html?id=${encodeURIComponent(nextStory.id)}`;
  } else {
    nextWrapper.style.visibility = "hidden";
  }
}

// -------------------------------------------------------------
// 4. Submission Form Logic
// -------------------------------------------------------------
function setupSubmitForm() {
  const form = document.getElementById("submission-form");
  if (!form) return;

  const titleInput = document.getElementById("story-title-input");
  const titleCharCounter = document.getElementById("title-char-counter");

  const storyInput = document.getElementById("story-content-input");
  const storyWordCounter = document.getElementById("story-word-counter");
  const fileInput = document.getElementById("story-file-upload");
  const fileInfoNote = document.getElementById("file-info-note");

  const bioInput = document.getElementById("author-bio-input");
  const bioWordCounter = document.getElementById("bio-word-counter");

  const errorSummary = document.getElementById("error-summary");
  const errorSummaryList = document.getElementById("error-summary-list");

  let formIsDirty = false;
  let attachedFile = null;

  // Track file selection
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      formIsDirty = true;
      const file = fileInput.files[0];
      if (!file) {
        attachedFile = null;
        if (fileInfoNote) fileInfoNote.textContent = "";
        return;
      }
      attachedFile = {
        name: file.name,
        size: file.size,
        type: file.type
      };

      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          storyInput.value = event.target.result;
          storyInput.dispatchEvent(new Event('input'));
          if (fileInfoNote) {
            fileInfoNote.textContent = `Loaded text from "${file.name}" (${(file.size / 1024).toFixed(1)} KB).`;
          }
        };
        reader.readAsText(file);
      } else {
        if (fileInfoNote) {
          fileInfoNote.textContent = `Attached file "${file.name}" (${(file.size / 1024).toFixed(1)} KB). Story can also be reviewed from this document.`;
        }
      }
    });
  }

  // Track dirty state to prevent accidental loss
  form.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => {
      formIsDirty = true;
    });
  });

  window.addEventListener("beforeunload", (e) => {
    if (formIsDirty) {
      e.preventDefault();
      e.returnValue = "You have unsaved text in your story submission. Are you sure you want to leave?";
    }
  });

  // Word counting helper
  function countWords(str) {
    if (!str) return 0;
    const matches = str.trim().match(/\S+/g);
    return matches ? matches.length : 0;
  }

  // Story live counter
  storyInput.addEventListener("input", () => {
    const count = countWords(storyInput.value);
    storyWordCounter.textContent = `${count} / 1000 words`;
    if (count > 1000) {
      storyWordCounter.classList.add("over-limit");
    } else {
      storyWordCounter.classList.remove("over-limit");
    }
  });

  // Title character counter
  titleInput.addEventListener("input", () => {
    const len = titleInput.value.length;
    titleCharCounter.textContent = `${len} / 120 characters`;
    if (len > 120) {
      titleCharCounter.classList.add("over-limit");
    } else {
      titleCharCounter.classList.remove("over-limit");
    }
  });

  // Bio live counter
  bioInput.addEventListener("input", () => {
    const count = countWords(bioInput.value);
    bioWordCounter.textContent = `${count} / 60 words`;
    if (count > 60) {
      bioWordCounter.classList.add("over-limit");
    } else {
      bioWordCounter.classList.remove("over-limit");
    }
  });

  // Form submission validation
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Check Honeypot
    const hp = document.getElementById("form-website-hp");
    if (hp && hp.value.trim() !== "") {
      console.warn("Spam honeypot triggered");
      window.location.href = "./thank-you.html";
      return;
    }

    // Reset errors
    const errors = [];
    document.querySelectorAll(".field-error").forEach(el => {
      el.classList.remove("is-active");
    });
    document.querySelectorAll(".form-control").forEach(el => {
      el.classList.remove("has-error");
    });
    errorSummary.classList.remove("is-active");
    errorSummaryList.innerHTML = "";

    // 1. Author Name
    const nameInput = document.getElementById("author-name");
    if (!nameInput.value.trim()) {
      showError(nameInput, "author-name-error", "Enter your full name.", errors);
    }

    // 2. Email
    const emailInput = document.getElementById("author-email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, "author-email-error", "Enter a valid email address.", errors);
    }

    // 3. Institution
    const instInput = document.getElementById("author-institution");
    if (!instInput.value.trim()) {
      showError(instInput, "author-institution-error", "Enter your university or institution.", errors);
    }

    // 4. Story Title
    const titleVal = titleInput.value.trim();
    if (!titleVal) {
      showError(titleInput, "story-title-error", "Enter a story title.", errors);
    } else if (titleVal.length > 120) {
      showError(titleInput, "story-title-error", `Your title is ${titleVal.length} characters. Shorten it to 120 or fewer.`, errors);
    }

    // 5. Story Body & Word Limit (or Attached File)
    const storyVal = storyInput.value.trim();
    const storyWords = countWords(storyVal);
    const hasFile = fileInput && fileInput.files && fileInput.files.length > 0;

    if (!storyVal && !hasFile) {
      showError(storyInput, "story-content-error", "Please provide your story text or upload a document (.pdf, .docx, .txt).", errors);
    } else if (storyVal && storyWords > 1000) {
      showError(storyInput, "story-content-error", `Your story is ${storyWords.toLocaleString()} words. Shorten it to 1,000 or fewer.`, errors);
    }

    // 6. Bio Word Limit
    const bioVal = bioInput.value.trim();
    const bioWords = countWords(bioVal);
    if (bioWords > 60) {
      showError(bioInput, "author-bio-error", `Your bio is ${bioWords} words. Shorten it to 60 or fewer.`, errors);
    }

    // 7. Checkboxes
    const origCheck = document.getElementById("confirm-original");
    if (!origCheck.checked) {
      showError(origCheck, "confirm-original-error", "Confirm that this is your original work.", errors);
    }

    const permCheck = document.getElementById("confirm-permission");
    if (!permCheck.checked) {
      showError(permCheck, "confirm-permission-error", "Give permission to publish your story.", errors);
    }

    const ageCheck = document.getElementById("confirm-age");
    if (!ageCheck.checked) {
      showError(ageCheck, "confirm-age-error", "Confirm you are 18 or older.", errors);
    }

    // If errors exist, render summary and focus it
    if (errors.length > 0) {
      errors.forEach(err => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${err.inputId}`;
        a.textContent = err.message;
        a.addEventListener("click", (evt) => {
          evt.preventDefault();
          const targetEl = document.getElementById(err.inputId);
          if (targetEl) {
            targetEl.focus();
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
        li.appendChild(a);
        errorSummaryList.appendChild(li);
      });

      errorSummary.classList.add("is-active");
      errorSummary.focus();
      return;
    }

    // If valid, store the submitted story in localStorage so it can immediately be read/tested
    const isAnonymous = document.querySelector('input[name="publish_anonymously"]:checked').value === "true";
    const slug = titleVal.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);

    const newStory = {
      id: slug,
      title: titleVal,
      author: nameInput.value.trim(),
      anonymous: isAnonymous,
      institution: instInput.value.trim(),
      bio: bioVal,
      prompt: "What does the environment look like in 100 years?",
      featuredArt: null,
      body: storyVal || (attachedFile ? `[Story attached as document: ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)]` : ""),
      attachedFile: attachedFile,
      submittedAt: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem("efa_submitted_stories") || "[]");
      existing.unshift(newStory);
      localStorage.setItem("efa_submitted_stories", JSON.stringify(existing));
    } catch (err) {
      console.error("Could not persist story", err);
    }

    // Disable beforeunload prompt
    formIsDirty = false;

    // Proceed to thank-you page
    window.location.href = "./thank-you.html";
  });

  function showError(inputEl, errorId, message, errorsArray) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("is-active");
    }
    inputEl.classList.add("has-error");
    errorsArray.push({ inputId: inputEl.id, message: message });
  }
}
