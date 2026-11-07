// Scrubber to purge any legacy mock / hardcoded sample data previously stored in browser localStorage
const LEGACY_SAMPLE_IDS = new Set([
  'sample-prod-1',
  'sample-prod-2',
  'sample-prod-3',
  'sample-prod-4',
  'modular-kitchens',
  'custom-wardrobes',
  'tv-units-paneling',
  'living-dining-woodwork',
  'on-site-installations',
  'proj-1',
  'proj-2',
  'proj-3',
  'offer-diwali',
  'offer-kitchen',
]);

const CACHE_KEYS = [
  'ss_cached_products',
  'ss_cached_services',
  'ss_cached_projects',
  'ss_cached_offers',
];

export const purgeLegacyCache = () => {
  try {
    CACHE_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((item) => item && !LEGACY_SAMPLE_IDS.has(item.id));
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      } catch (_) {
        localStorage.removeItem(key);
      }
    });
  } catch (err) {
    console.warn('Could not scrub legacy cache:', err);
  }
};

