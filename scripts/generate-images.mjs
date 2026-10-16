import fs from "node:fs";
import path from "node:path";

const products = [
  ["men-oxford-shirt", "shirt", "#f4f0e8", "#cfc4b4"],
  ["men-linen-shirt", "shirt", "#e7e1d6", "#b7aa98"],
  ["men-plain-tee", "tshirt", "#f7f7f5", "#d9d3c8"],
  ["men-heavy-tee", "tshirt", "#f3efe8", "#c8bfb2"],
  ["men-daily-hoodie", "hoodie", "#f2efe8", "#c9bfb0"],
  ["men-crew-sweat", "hoodie", "#ece7df", "#b9ae9e"],
  ["men-hoodie-set", "set", "#f6f3ee", "#d2c7b8"],
  ["men-tee-set", "set", "#f7f5f1", "#cfc6ba"],
  ["men-straight-jeans", "pants", "#6d88a8", "#d5cbbd"],
  ["men-chino", "pants", "#c4b49a", "#ddd4c6"],
  ["men-denim-shorts", "shorts", "#6f8eaf", "#d8cfc2"],
  ["men-cotton-shorts", "shorts", "#d7c4a4", "#e4d9c8"],
  ["men-leather-sneaker", "shoes", "#6b4a34", "#e6dccf"],
  ["men-white-sneaker", "shoes", "#f4f1ec", "#ddd4c8"],
  ["men-cap", "cap", "#6e2d38", "#e7dcd0"],
  ["men-belt", "belt", "#5c4030", "#e5d9cc"],
  ["women-blouse", "blouse", "#f7f1ea", "#e3d5c8"],
  ["women-silk-blouse", "blouse", "#f3e6ea", "#e7d4d4"],
  ["women-tee", "tshirt", "#f6f3ef", "#ddd2c6"],
  ["women-rib-tee", "tshirt", "#efe6df", "#d9c9bc"],
  ["women-hoodie", "hoodie", "#f3eee8", "#d5c8ba"],
  ["women-zip-hoodie", "hoodie", "#ece4dc", "#cbbbaa"],
  ["women-set", "set", "#f6f1ec", "#e2d4c8"],
  ["women-knit-set", "set", "#e9dfd6", "#d8c8ba"],
  ["women-wide-pants", "pants", "#cbb79a", "#e6d9cc"],
  ["women-jeans", "pants", "#7f92a8", "#ddd3c6"],
  ["women-skirt", "skirt", "#2c3444", "#e5d9ce"],
  ["women-long-skirt", "skirt", "#8d3b45", "#eddcd4"],
  ["women-heel", "shoes", "#1e1e1e", "#eadfd4"],
  ["women-sneaker", "shoes", "#f5f2ee", "#e3d8cc"],
  ["women-scarf", "scarf", "#8d3d45", "#f0e0d6"],
  ["women-bag", "bag", "#c4a574", "#eadfD2"],
  ["kids-shirt", "shirt", "#e7f0f6", "#d5e3ea"],
  ["kids-tee", "tshirt", "#f7f3e8", "#e7dcc8"],
  ["kids-hoodie", "hoodie", "#e8eef6", "#d5dde8"],
  ["kids-set", "set", "#f6f1e8", "#e4d8c8"],
  ["kids-pants", "pants", "#8ea4b8", "#e3d9cc"],
  ["kids-shorts", "shorts", "#7f9eb8", "#e6dcc8"],
  ["kids-shoes", "shoes", "#f4f2ee", "#e5d9cc"],
  ["kids-cap", "cap", "#1e3a5f", "#e7dccc"],
];

function shadow() {
  return `<ellipse cx="200" cy="470" rx="92" ry="14" fill="#000" opacity="0.12"/>`;
}

function shirt(fill) {
  return `
    <path d="M158 88 L128 128 L78 158 L98 214 L146 182 L146 412 L254 412 L254 182 L302 214 L322 158 L272 128 L242 88 L214 118 Q200 136 186 118 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".18" stroke-width="2"/>
    <path d="M186 116 L176 86 Q200 108 224 86 L214 116 Q200 132 186 116 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".25" stroke-width="2"/>
    <path d="M200 132 V392" stroke="#1c140e" stroke-opacity=".18"/>
    <circle cx="200" cy="168" r="3" fill="#1c140e" opacity=".35"/>
    <circle cx="200" cy="196" r="3" fill="#1c140e" opacity=".35"/>
    <circle cx="200" cy="224" r="3" fill="#1c140e" opacity=".35"/>
  `;
}

function tshirt(fill) {
  return `
    <path d="M150 110 L112 146 L86 186 L128 214 L156 176 L156 400 L244 400 L244 176 L272 214 L314 186 L288 146 L250 110 Q200 150 150 110 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
  `;
}

function hoodie(fill) {
  return `
    <path d="M150 128 L118 160 L84 196 L122 228 L152 190 L152 408 L248 408 L248 190 L278 228 L316 196 L282 160 L250 128 Q230 108 200 118 Q170 108 150 128 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
    <path d="M168 126 Q200 168 232 126 Q214 112 200 116 Q186 112 168 126 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".2" stroke-width="2"/>
    <path d="M168 300 h64 v48 h-64 z" fill="#000" opacity=".06"/>
    <path d="M200 168 v40" stroke="#1c140e" stroke-opacity=".2"/>
  `;
}

function pants(fill) {
  return `
    <path d="M150 96 h100 l8 300 h-46 l-12-210 l-12 210 h-46 z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
    <path d="M150 96 h100 v18 h-100 z" fill="#000" opacity=".06"/>
  `;
}

function shorts(fill) {
  return `
    <path d="M148 140 h104 l10 168 h-48 l-14-92 l-14 92 h-48 z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
    <path d="M148 140 h104 v16 h-104 z" fill="#000" opacity=".06"/>
  `;
}

function shoes(fill) {
  return `
    <path d="M118 300 C150 250 190 248 230 262 C280 280 320 278 336 300 C346 314 330 336 250 340 L130 340 C104 338 100 318 118 300 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".2" stroke-width="2"/>
    <path d="M150 292 C190 274 230 276 268 292" fill="none" stroke="#1c140e" stroke-opacity=".2"/>
  `;
}

function cap(fill) {
  return `
    <path d="M126 250 C140 160 260 160 274 250 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".18" stroke-width="2"/>
    <path d="M126 246 h168 c8 18 8 36 -2 48 H150 c-20-8-28-24-24-48 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".18" stroke-width="2"/>
    <path d="M274 250 h62 c8 10 6 28 -10 34 h-58" fill="${fill}" stroke="#1c140e" stroke-opacity=".18" stroke-width="2"/>
  `;
}

function belt(fill) {
  return `
    <rect x="70" y="230" width="250" height="36" rx="6" fill="${fill}" stroke="#1c140e" stroke-opacity=".2" stroke-width="2"/>
    <rect x="292" y="222" width="42" height="52" rx="4" fill="#d9d3c8" stroke="#1c140e" stroke-opacity=".25"/>
    <circle cx="313" cy="248" r="6" fill="none" stroke="#1c140e" stroke-opacity=".35"/>
  `;
}

function set(fill) {
  return `
    <g transform="translate(-36,-10) scale(.72)">
      ${tshirt(fill)}
    </g>
    <g transform="translate(70,40) scale(.62)">
      ${pants(fill)}
    </g>
  `;
}

function blouse(fill) {
  return `
    <path d="M156 100 L124 138 L86 168 L112 220 L150 184 L146 300 Q200 340 254 300 L250 184 L288 220 L314 168 L276 138 L244 100 Q200 140 156 100 Z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
  `;
}

function skirt(fill) {
  return `
    <path d="M156 150 h88 l36 250 h-160 z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
    <path d="M156 150 h88 v16 h-88 z" fill="#000" opacity=".06"/>
  `;
}

function scarf(fill) {
  return `
    <path d="M150 120 h70 v250 l-35 28 l-35-28 z" fill="${fill}" stroke="#1c140e" stroke-opacity=".16" stroke-width="2"/>
    <path d="M150 150 h70 M150 180 h70 M150 210 h70" stroke="#fff" stroke-opacity=".25"/>
  `;
}

function bag(fill) {
  return `
    <rect x="130" y="180" width="140" height="160" rx="16" fill="${fill}" stroke="#1c140e" stroke-opacity=".18" stroke-width="2"/>
    <path d="M160 180 v-28 a40 40 0 0 1 80 0 v28" fill="none" stroke="#1c140e" stroke-opacity=".28" stroke-width="6"/>
  `;
}

const draw = { shirt, tshirt, hoodie, pants, shorts, shoes, cap, belt, set, blouse, skirt, scarf, bag };

function svg(fill, bg, garment) {
  const light = mix(bg, "#ffffff", 0.45);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="75%">
      <stop offset="0%" stop-color="${light}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </radialGradient>
  </defs>
  <rect width="400" height="520" fill="url(#bg)"/>
  ${shadow()}
  ${draw[garment](fill)}
</svg>`;
}

function mix(hex, _other, amount) {
  const n = hex.replace("#", "");
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  const lift = (c) => Math.min(255, Math.round(c + (255 - c) * amount));
  return `#${[lift(r), lift(g), lift(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

const dir = path.resolve("public/images");
fs.mkdirSync(dir, { recursive: true });
for (const [slug, garment, fill, bg] of products) {
  fs.writeFileSync(path.join(dir, `${slug}.svg`), svg(fill, bg, garment));
}
console.log(`wrote ${products.length} images`);
