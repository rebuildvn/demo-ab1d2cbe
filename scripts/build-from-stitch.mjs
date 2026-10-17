#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const runtimeOverlay = fs.readFileSync(path.join(root, 'stitch/overlays/smeup-runtime.html'), 'utf8');

const HEAD_DESKTOP = `<meta name="robots" content="noindex, nofollow"/>
<meta name="theme-color" content="#a82424"/>
<link rel="canonical" href="https://demo-ab1d2cbe.demo.rebuild.vn/"/>
<link rel="preconnect" href="https://api.smess.vn" crossorigin/>
<link rel="stylesheet" href="/assets/css/rebuild-demo.css"/>
<script>(function(){if(/[?&]desktop=1/.test(location.search))return;if(window.matchMedia('(max-width:768px)').matches)location.replace('/m/'+location.hash);})();</script>`;

const HEAD_MOBILE = `<meta name="robots" content="noindex, nofollow"/>
<meta name="theme-color" content="#a82424"/>
<link rel="canonical" href="https://demo-ab1d2cbe.demo.rebuild.vn/m/"/>
<link rel="preconnect" href="https://api.smess.vn" crossorigin/>
<link rel="stylesheet" href="/assets/css/rebuild-demo.css"/>`;

const RUNTIME_SCRIPTS = `
<script src="/assets/js/site-config.js"></script>
<script src="/assets/js/smeup-core.js" defer></script>
<script src="/assets/js/contact-form.js" defer></script>
<script src="/assets/js/stitch-booking.js" defer></script>
<script src="/assets/js/livechat.js" defer></script>
<script src="/assets/js/demo-cta.js" defer></script>
`;

function injectHead(html, extra) {
  return html.replace(
    /<meta content="width=device-width[^"]*" name="viewport"\/>/,
    (m) => `${m}\n${extra}`
  );
}

function injectRuntime(html, insertBeforePattern) {
  if (!html.includes(insertBeforePattern)) {
    throw new Error(`Missing anchor: ${insertBeforePattern}`);
  }
  html = html.replace(insertBeforePattern, `${runtimeOverlay}\n${insertBeforePattern}`);
  return html.replace('</body></html>', `${RUNTIME_SCRIPTS}</body></html>`);
}

function buildDesktop() {
  const source = path.join(root, 'stitch/export/home-desktop.html');
  let html = fs.readFileSync(source, 'utf8');

  html = injectHead(html, HEAD_DESKTOP);

  html = html.replace(
    /<form([^>]*id="booking-form"[^>]*) onsubmit="[^"]*"/,
    '<form$1 data-stitch-booking="desktop"'
  );

  html = injectRuntime(html, '<footer class="w-full bg-surface-container-lowest');

  fs.writeFileSync(path.join(root, 'index.html'), html);
  console.log('Built index.html (Stitch desktop, design-faithful)');
}

function buildMobile() {
  const source = path.join(root, 'stitch/export/home-mobile.html');
  let html = fs.readFileSync(source, 'utf8');

  html = injectHead(html, HEAD_MOBILE);

  html = html.replace(
    /<form class="flex flex-col gap-4" id="fastBookingForm" onsubmit="[^"]*">/,
    '<form class="flex flex-col gap-4" id="fastBookingForm" data-stitch-booking="mobile">'
  );

  html = html.replace(
    /function handleBookingSubmit\(\) \{[\s\S]*?\n  \}/,
    'function handleBookingSubmit() {\n    if (window.StitchBooking && window.StitchBooking.submitMobile) {\n      window.StitchBooking.submitMobile();\n    }\n  }'
  );

  html = injectRuntime(html, '<nav class="fixed bottom-0 w-full z-50 pb-safe');

  const outDir = path.join(root, 'm');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  console.log('Built m/index.html (Stitch mobile, design-faithful)');
}

buildDesktop();
buildMobile();
