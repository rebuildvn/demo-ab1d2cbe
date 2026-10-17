#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const source = path.join(root, 'stitch/export/home-desktop.html');
const overlay = path.join(root, 'stitch/overlays/rebuild-smeup.html');
const out = path.join(root, 'index.html');

let html = fs.readFileSync(source, 'utf8');

html = html.replace(
  /<meta content="width=device-width, initial-scale=1.0" name="viewport"\/>/,
  `<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<meta name="robots" content="noindex, nofollow"/>
<meta name="theme-color" content="#a82424"/>
<link rel="canonical" href="https://demo-ab1d2cbe.demo.rebuild.vn/"/>
<link rel="preconnect" href="https://api.smess.vn" crossorigin/>
<link rel="stylesheet" href="/assets/css/rebuild-demo.css"/>`
);

html = html.replace(
  /<form([^>]*id="booking-form"[^>]*) onsubmit="[^"]*"/,
  '<form$1 data-smeup-form="contact_form" data-message-required="true" novalidate'
);

const bookingFields = `
<div class="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-2 border-t border-koge-border/40">
<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md uppercase text-secondary tracking-wider" for="booking-name">Họ và tên</label>
<input class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md focus:outline-none focus:ring-1 focus:ring-flame-amber" id="booking-name" name="name" type="text" autocomplete="name" required maxlength="255"/>
</div>
<div class="flex flex-col gap-1.5">
<label class="font-label-md text-label-md uppercase text-secondary tracking-wider" for="booking-phone">Số điện thoại</label>
<input class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md focus:outline-none focus:ring-1 focus:ring-flame-amber" id="booking-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"/>
</div>
<textarea class="hidden" name="message" id="booking-message" aria-hidden="true" tabindex="-1"></textarea>
<div class="hp" aria-hidden="true"><label for="booking-website">Website</label><input id="booking-website" name="website" type="text" tabindex="-1" autocomplete="off"/></div>
<p class="sm:col-span-2 font-body-md text-body-md text-flame-amber min-h-[1.5em]" role="status" aria-live="polite" data-form-status></p>
</div>`;

html = html.replace(
  /<!-- Field 5: Submit CTA -->/,
  bookingFields + '\n<!-- Field 5: Submit CTA -->'
);

html = html.replace(
  /<select class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" required="">/,
  '<select class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" name="branch" required="">'
);

html = html.replace(
  /<select class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" required="">\s*<option value="2">/,
  '<select class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" name="guests" required="">\n<option value="2">'
);

html = html.replace(
  /<input class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" required="" type="date"/,
  '<input class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" name="date" required type="date"'
);

html = html.replace(
  /<select class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" required="">\s*<option value="10:00">/,
  '<select class="w-full h-12 px-3.5 bg-surface-container text-on-surface rounded font-body-md text-body-md appearance-none focus:outline-none focus:ring-1 focus:ring-flame-amber cursor-pointer" name="time" required="">\n<option value="10:00">'
);

const overlayHtml = fs.readFileSync(overlay, 'utf8');
const scripts = `
<script src="/assets/js/site-config.js"></script>
<script src="/assets/js/smeup-core.js" defer></script>
<script src="/assets/js/contact-form.js" defer></script>
<script src="/assets/js/stitch-booking.js" defer></script>
<script src="/assets/js/livechat.js" defer></script>
<script src="/assets/js/demo-cta.js" defer></script>
`;

html = html.replace('</body></html>', overlayHtml + scripts + '</body></html>');

fs.writeFileSync(out, html);
console.log('Built', out, 'from Stitch export');
