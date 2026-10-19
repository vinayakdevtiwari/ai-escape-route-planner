import * as THREE from 'three';

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Cafeteria: checker tile (procedural CanvasTexture 2x2 repeat, white/dark grey)
 */
export function getCheckerTileTexture(): THREE.CanvasTexture {
  const key = 'checker_tile_realistic';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const tileSize = size / 2;
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 2; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#E2E8F0' : '#4B5563';
      ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

      // Fine architectural grout seam
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Offices: grey carpet, color #4a4f5a, roughness 0.95, noise bump map
 */
export function getCarpetTexture(color: string = '#4A4F5A'): THREE.CanvasTexture {
  const key = `carpet_realistic_${color}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);

  // Micro fiber noise for carpet texture
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Corridor and lobby: polished concrete, color #8a8f98, roughness 0.3, subtle noise normal/texture
 */
export function getConcreteTexture(): THREE.CanvasTexture {
  const key = 'concrete_polished';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Polished concrete color #8a8f98
  ctx.fillStyle = '#8A8F98';
  ctx.fillRect(0, 0, size, size);

  // Expansion joint lines
  ctx.strokeStyle = '#71767F';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, 128, 128);
  ctx.strokeRect(128, 0, 128, 128);
  ctx.strokeRect(0, 128, 128, 128);
  ctx.strokeRect(128, 128, 128, 128);

  // Subtle aggregate mineral specks
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const shade = Math.random() > 0.5 ? 160 : 120;
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.2)`;
    ctx.fillRect(rx, ry, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Datacenter: dark raised-floor tile grid, color #1c2029
 */
export function getDatacenterTileTexture(): THREE.CanvasTexture {
  const key = 'datacenter_tile_dark';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark raised-floor tile grid #1c2029
  ctx.fillStyle = '#1C2029';
  ctx.fillRect(0, 0, size, size);

  // Metal tile border seams
  ctx.strokeStyle = '#2E3544';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(2, 2, size - 4, size - 4);

  // Subtle ventilation perforation holes
  ctx.fillStyle = '#0F1218';
  for (let y = 16; y < size - 16; y += 16) {
    for (let x = 16; x < size - 16; x += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Conference: dark wood, color #3b2a20, roughness 0.5
 */
export function getDarkWoodTexture(): THREE.CanvasTexture {
  const key = 'dark_wood_floor';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Dark wood base #3b2a20
  ctx.fillStyle = '#3B2A20';
  ctx.fillRect(0, 0, size, size);

  // Planks lines
  const plankHeight = size / 6;
  ctx.strokeStyle = '#271B14';
  ctx.lineWidth = 2;
  for (let y = 0; y <= size; y += plankHeight) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();

    // Wood grain lines
    for (let i = 0; i < 8; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(65, 46, 35, 0.4)' : 'rgba(35, 23, 16, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + (i * plankHeight) / 8);
      ctx.bezierCurveTo(
        size * 0.3,
        y + (i * plankHeight) / 8 + (Math.random() * 4 - 2),
        size * 0.7,
        y + (i * plankHeight) / 8 + (Math.random() * 4 - 2),
        size,
        y + (i * plankHeight) / 8
      );
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Route Chevron / Arrow texture for glowing ribbon
 */
export function getRouteArrowTexture(): THREE.CanvasTexture {
  const key = 'route_arrow_glow';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const width = 256;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  // Forward glowing chevrons
  for (let x = 16; x < width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 14);
    ctx.lineTo(x + 22, height / 2);
    ctx.lineTo(x, height - 14);
    ctx.lineTo(x + 10, height - 14);
    ctx.lineTo(x + 32, height / 2);
    ctx.lineTo(x + 10, 14);
    ctx.closePath();

    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  textureCache.set(key, texture);
  return texture;
}

/**
 * Wall-mounted presentation display screen texture
 */
export function getPresentationDisplayTexture(): THREE.CanvasTexture {
  const key = 'display_screen_presentation';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const width = 512;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, width, height);

  // Top header bar
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(0, 0, width, 36);

  ctx.fillStyle = '#0284C7';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('CRITICAL FACILITY MONITORING & EVACUATION PROTOCOLS', 16, 24);

  // Status badges
  ctx.fillStyle = '#16A34A';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('STATUS: SYSTEMS NOMINAL', 16, 68);

  ctx.fillStyle = '#38BDF8';
  ctx.fillText('AIR QUALITY: 99.4%', 16, 92);
  ctx.fillText('FIRE SUPPRESSION: STANDBY', 16, 116);
  ctx.fillText('EVACUATION EXITS: ACCESSIBLE (EAST / WEST)', 16, 140);

  // Simulated live architectural floor telemetry chart
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(280, 210);
  ctx.lineTo(330, 160);
  ctx.lineTo(380, 180);
  ctx.lineTo(430, 120);
  ctx.lineTo(480, 100);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  textureCache.set(key, texture);
  return texture;
}
