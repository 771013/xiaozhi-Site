// Keep the design exports with the application instead of depending on
// short-lived Figma MCP links. `public/assets` is served from /assets by Vite
// both locally and in production builds.
const localAssets = {
  'b086f.png': 'brand-logo.png',
  'b7255.svg': 'header-logo.svg',
  '231fa.svg': '042d5.svg',
  '742af.svg': '907dd.svg',
  '661cc.png': 'hero-visual.png',
  'bd5f5.png': 'hero-visual-figma4.png',
  '0265e.svg': 'compare-price-icon.svg',
  'b35c9.svg': 'compare-shield-icon.svg',
  '5d01d.svg': 'compare-list-icon.svg',
  'compare-price-active.svg': 'compare-price-active.svg',
  'compare-shield-inactive.svg': 'compare-shield-inactive.svg',
  'compare-list-active.svg': 'compare-list-active.svg',
  'ce712.svg': 'service-deposit.svg',
  '8a9f2.svg': 'service-cancel.svg',
  'bb329.svg': 'service-car-guarantee.svg',
  '4ce44.svg': 'service-new-car.svg',
  '84dd4.svg': 'service-mileage.svg',
  '53b10.svg': 'service-upgrade.svg',
  'efb75.svg': 'service-delivery.svg',
  '63637.png': 'contact-wave.png',
  '250d0.png': 'contact-mascot.png',
}

export const asset = (filename) => `/assets/${localAssets[filename] ?? filename}`
