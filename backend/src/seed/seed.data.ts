/**
 * Deterministic seed data with fixed ObjectId hex strings and reproducible timestamps.
 */

export const SEED_PEOPLE = [
  {
    _id: '663675f3a093a1d9426f0001',
    name: 'Alice Oceanographer',
  },
  {
    _id: '663675f3a093a1d9426f0002',
    name: 'Bob Deepdiver',
  },
  {
    _id: '663675f3a093a1d9426f0003',
    name: 'Charlie Marine',
  },
];

export const SEED_SITES = [
  {
    _id: '663675f3a093a1d9426f0101',
    address: 'tidepool.zz',
    title: 'Tidepool Ecosystem Hub',
    authorId: '663675f3a093a1d9426f0001',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #0284c7;">Welcome to Tidepool Hub</h1>
        <p>Tidepools are rocky pools on the sea shore that are filled with seawater. Discover fragile marine life and micro-habitats.</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <h3>Explore the Network:</h3>
        <ul>
          <li><a href="coral-reef.zz">Visit the Coral Reef Sanctuary</a></li>
          <li><a href="kelp-forest.zz">Dive into the Giant Kelp Forest</a></li>
          <li><a href="lighthouse.zz">Check Harbor Conditions at The Lighthouse</a></li>
          <li><a href="sunken-ruins.zz">Explore Sunken Ruins (Warning: Uncharted/Broken Link)</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0102',
    address: 'coral-reef.zz',
    title: 'Coral Reef Sanctuary',
    authorId: '663675f3a093a1d9426f0001',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #f43f5e;">Coral Reef Biodiversity Reserve</h1>
        <p>Corals build massive calcium carbonate structures that shelter more than 25% of all marine species.</p>
        <p>Polyps thrive in shallow, sunlit tropical waters where symbiotic algae provide oxygen and nutrients.</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <h3>Navigation:</h3>
        <ul>
          <li><a href="starfish.zz">Meet the Starfish of the Reef</a></li>
          <li><a href="atoll.zz">Navigate to the Outer Atoll</a></li>
          <li><a href="tidepool.zz">&larr; Return to Tidepool Hub</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0103',
    address: 'deep-trench.zz',
    title: 'Mariana Abyss Deep Trench',
    authorId: '663675f3a093a1d9426f0002',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; background-color: #0f172a; color: #f8fafc;">
        <h1 style="color: #38bdf8;">The Midnight Zone & Abyss</h1>
        <p>Plunging over 11,000 meters into perpetual darkness, hadal trenches experience crushing hydrostatic pressure.</p>
        <p>Bioluminescent creatures, amphipods, and xenophyophores flourish in chemosynthetic environments.</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #334155;" />
        <ul>
          <li><a href="nautilus.zz" style="color: #67e8f9;">Submersible Log: USS Nautilus</a></li>
          <li><a href="abyss.zz" style="color: #67e8f9;">Descent to the Challenger Deep</a></li>
          <li><a href="tidepool.zz" style="color: #94a3b8;">Ascend to Surface Tidepool</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0104',
    address: 'lighthouse.zz',
    title: 'Cape Horn Lighthouse Observations',
    authorId: '663675f3a093a1d9426f0003',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #d97706;">Cape Horn Lighthouse</h1>
        <p>Serving mariners through stormy seas, the lighthouse beacon pierces dense oceanic fog and raging gales.</p>
        <p>Current Barometer: 1012 hPa. Wind: West-Northwest at 28 knots. Sea state: Rough.</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <ul>
          <li><a href="driftwood.zz">Coastline Driftwood Archives</a></li>
          <li><a href="tidepool.zz">Return to Shore Tidepools</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0105',
    address: 'abyss.zz',
    title: 'Abyssal Plain Research Station',
    authorId: '663675f3a093a1d9426f0002',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #6366f1;">Autonomous Abyssal Station Alpha</h1>
        <p>Telemetry data streaming from benthic sensors placed across the oceanic crust.</p>
        <p>Hydrothermal vents emit mineral-rich black smoker plumes supporting extremophile bacteria.</p>
        <ul>
          <li><a href="deep-trench.zz">Back to Deep Trench</a></li>
          <li><a href="nautilus.zz">Contact Nautilus Sub</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0106',
    address: 'driftwood.zz',
    title: 'Driftwood Coastal Museum',
    authorId: '663675f3a093a1d9426f0003',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #78350f;">Driftwood & Beachcombing History</h1>
        <p>Every piece of weathered wood washed ashore carries decades of maritime voyages across trade winds.</p>
        <p>Catalogued timber samples from ancient schooners and Pacific driftwood rafts.</p>
        <ul>
          <li><a href="lighthouse.zz">View Lighthouse Signal</a></li>
          <li><a href="atoll.zz">Explore Tropical Atoll</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0107',
    address: 'kelp-forest.zz',
    title: 'Monterey Giant Kelp Forest',
    authorId: '663675f3a093a1d9426f0001',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #15803d;">Giant Kelp (Macrocystis pyrifera)</h1>
        <p>Reaching heights of over 45 meters, giant kelp forests form underwater canopies teeming with sea otters, garibaldi, and seals.</p>
        <p>They sequester vast amounts of carbon while attenuating heavy coastal storm surges.</p>
        <ul>
          <li><a href="tidepool.zz">Return to Tidepool</a></li>
          <li><a href="starfish.zz">Observe Invertebrates</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0108',
    address: 'nautilus.zz',
    title: 'Research Vessel Nautilus Expedition',
    authorId: '663675f3a093a1d9426f0002',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #0369a1;">R/V Nautilus Hydrographic Survey</h1>
        <p>Equipped with multibeam sonar, ROV Hercules, and atmospheric dive suits for deep exploration.</p>
        <ul>
          <li><a href="abyss.zz">Abyssal Monitoring Point</a></li>
          <li><a href="deep-trench.zz">Deep Trench Operations</a></li>
          <li><a href="lost-shipwreck.zz">Investigate Uncharted Wreck (Broken Link)</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0109',
    address: 'starfish.zz',
    title: 'Echinoderm & Starfish Field Guide',
    authorId: '663675f3a093a1d9426f0001',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #e11d48;">Asteroids & Echinoderms Guide</h1>
        <p>Starfish display five-fold radial symmetry and a hydraulic water vascular system powering hundreds of tube feet.</p>
        <p>Ochre sea stars act as keystone predators controlling mussel beds in rocky intertidal zones.</p>
        <ul>
          <li><a href="coral-reef.zz">Reef Sanctuary</a></li>
          <li><a href="kelp-forest.zz">Kelp Forest Habitats</a></li>
        </ul>
      </div>
    `,
  },
  {
    _id: '663675f3a093a1d9426f0110',
    address: 'atoll.zz',
    title: 'Blue Lagoon Coral Atoll',
    authorId: '663675f3a093a1d9426f0003',
    html: `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.6;">
        <h1 style="color: #0d9488;">Blue Lagoon Atoll Ring</h1>
        <p>A ring-shaped coral reef encircling a sheltered crystal turquoise lagoon over a submerged volcanic peak.</p>
        <p>Manta rays and blacktip reef sharks navigate channels through the barrier reef during tidal shifts.</p>
        <ul>
          <li><a href="coral-reef.zz">Coral Biodiversity</a></li>
          <li><a href="driftwood.zz">Shore Driftwood</a></li>
          <li><a href="tidepool.zz">Main Tidepool Portal</a></li>
        </ul>
      </div>
    `,
  },
];

