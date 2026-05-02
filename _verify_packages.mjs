ery(img => img.alt && img.alt.length > 10);
  console.log('  all images have descriptive alt: ' + allAlt);
});
llery.images.length + ' images (min 4)');
  console.log('  testimonials: ' + s.testimonials.items.length + ' items (min 3)');
  console.log('  cta: heading=' + (s.cta.heading ? 'YES' : 'NO') + ', body=' + (s.cta.body ? 'YES' : 'NO') + ', buttonText=' + (s.cta.buttonText ? 'YES' : 'NO'));
  const allWebp = s.gallery.images.every(img => img.src.includes('w=800') && img.src.includes('q=80') && img.src.includes('fm=webp'));
  console.log('  all images optimized: ' + allWebp);
  const allAlt = s.gallery.images.evgs = ['cafe-coffee-shop', 'hotel-bnb'];
slugs.forEach(slug => {
  const pkg = packages.find(p => p.slug === slug);
  if (!pkg) { console.log(slug + ': NOT FOUND'); return; }
  const s = pkg.sections;
  console.log(slug + ':');
  console.log('  hero: headline=' + (s.hero.headline ? 'YES' : 'NO') + ', subheadline=' + (s.hero.subheadline ? 'YES' : 'NO') + ', ctaText=' + (s.hero.ctaText ? 'YES' : 'NO'));
  console.log('  services: ' + s.services.items.length + ' items (min 3)');
  console.log('  gallery: ' + s.gaimport packages from './src/data/packages.js';

const slu