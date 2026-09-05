import { Agent } from '../../lib/types';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  maxLife: number;
  life: number;
}

/**
 * Draw a pixelated character sprite directly to Canvas 2D
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  tick: number,
  isSelected: boolean,
  isHovered: boolean
): void {
  const { x, y } = agent.coordinates;
  const config = agent.avatarConfig;
  const isWalking = agent.status === 'WALKING';
  const isCoding = agent.status === 'CODING';

  // Walk cycle bobbing
  const walkBob = isWalking ? Math.sin(tick * 0.25) * 3 : 0;
  const legOffset = isWalking ? Math.sin(tick * 0.25) * 4 : 0;
  const typeBob = isCoding ? Math.sin(tick * 0.4) * 1.5 : 0;

  ctx.save();
  ctx.translate(x, y + walkBob + typeBob);

  // 1. Selection / Hover Halo (Warm Amber / Muted Sage Glow)
  if (isSelected || isHovered) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? 'rgba(233, 196, 106, 0.45)' : 'rgba(132, 169, 140, 0.4)';
    ctx.shadowColor = isSelected ? '#e9c46a' : '#84a98c';
    ctx.shadowBlur = isSelected ? 12 : 7;
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#f4a261' : '#52796f';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  } else {
    // Subtle shadow under feet
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40, 35, 30, 0.35)';
    ctx.fill();
    ctx.restore();
  }

  // Direction facing: if target is to the left of current, flip
  const dx = agent.targetCoordinates.x - agent.coordinates.x;
  if (dx < -1) {
    ctx.scale(-1, 1);
  }

  // 2. Legs / Shoes
  ctx.fillStyle = '#2c221e'; // Leather brown shoes
  if (isWalking) {
    ctx.fillRect(-6, 8 + legOffset, 5, 6);
    ctx.fillRect(1, 8 - legOffset, 5, 6);
  } else {
    ctx.fillRect(-6, 8, 5, 6);
    ctx.fillRect(1, 8, 5, 6);
  }

  // 3. Pants
  ctx.fillStyle = config.pantsColor || '#2d3730';
  ctx.fillRect(-6, 2, 12, 7);

  // 4. Torso / Shirt
  ctx.fillStyle = config.shirtColor || '#386641';
  ctx.fillRect(-8, -10, 16, 13);

  // Tie / Collar / Details
  if (config.accessory === 'tie') {
    ctx.fillStyle = '#bc4749'; // Classic burgundy tie
    ctx.fillRect(-1.5, -9, 3, 8);
  } else if (config.accessory === 'badge') {
    ctx.fillStyle = '#e9c46a'; // Brass badge
    ctx.fillRect(-5, -6, 3, 4);
  }

  // Arms / Hands
  ctx.fillStyle = config.shirtColor || '#386641';
  if (isCoding) {
    // Typing arms
    ctx.fillRect(-10, -8, 3, 7);
    ctx.fillRect(7, -8, 3, 7);
    ctx.fillStyle = config.skinColor || '#f5d0a9';
    const handJiggle = Math.sin(tick * 0.5) * 2;
    ctx.fillRect(-9, -2 + handJiggle, 4, 3);
    ctx.fillRect(5, -2 - handJiggle, 4, 3);
  } else {
    ctx.fillRect(-10, -9, 3, 9);
    ctx.fillRect(7, -9, 3, 9);
    ctx.fillStyle = config.skinColor || '#f5d0a9';
    ctx.fillRect(-10, 0, 3, 3);
    ctx.fillRect(7, 0, 3, 3);
  }

  // 5. Head / Face
  ctx.fillStyle = config.skinColor || '#f5d0a9';
  ctx.fillRect(-7, -22, 14, 13);

  // Eyes & Blink
  const isBlinking = tick % 140 > 134;
  if (!isBlinking) {
    ctx.fillStyle = '#1c1815';
    ctx.fillRect(-4, -17, 2, 3);
    ctx.fillRect(2, -17, 2, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-4, -17, 1, 1);
    ctx.fillRect(2, -17, 1, 1);
  } else {
    ctx.fillStyle = '#1c1815';
    ctx.fillRect(-4, -16, 3, 1);
    ctx.fillRect(2, -16, 3, 1);
  }

  // Glasses
  if (config.accessory === 'glasses') {
    ctx.strokeStyle = '#9a7b56';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-5, -18, 4, 4);
    ctx.strokeRect(1, -18, 4, 4);
    ctx.beginPath();
    ctx.moveTo(-1, -16);
    ctx.lineTo(1, -16);
    ctx.stroke();
  }

  // Headphones
  if (config.accessory === 'headphones') {
    ctx.strokeStyle = '#52796f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -22, 8, Math.PI, 0, false);
    ctx.stroke();
    ctx.fillStyle = '#354f52';
    ctx.fillRect(-8, -19, 3, 6);
    ctx.fillRect(5, -19, 3, 6);
  }

  // 6. Hair
  ctx.fillStyle = config.hairColor || '#382212';
  if (config.hairStyle === 'slick') {
    ctx.fillRect(-8, -25, 16, 5);
    ctx.fillRect(-8, -22, 3, 4);
  } else if (config.hairStyle === 'ponytail') {
    ctx.fillRect(-8, -25, 16, 5);
    ctx.fillRect(-10, -23, 4, 9);
  } else if (config.hairStyle === 'parted') {
    ctx.fillRect(-8, -25, 16, 4);
    ctx.fillRect(-8, -22, 2, 4);
    ctx.fillRect(6, -22, 2, 4);
  } else {
    ctx.fillRect(-8, -25, 16, 5);
    ctx.fillRect(-9, -26, 4, 3);
    ctx.fillRect(2, -26, 5, 3);
  }

  ctx.restore();

  // 7. Status Speech Bubble overhead
  drawSpeechBubble(ctx, agent, x, y - 28 + walkBob, tick, isSelected);
}

/**
 * Draw animated overhead speech bubble in deep olive-slate and sage theme
 */
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  tick: number,
  isSelected: boolean
): void {
  const text = agent.currentAction || agent.name;
  ctx.save();

  ctx.font = 'bold 9px "JetBrains Mono", Menlo, Consolas, monospace';
  const textWidth = ctx.measureText(text).width;
  const bubbleWidth = Math.max(textWidth + 24, 75);
  const bubbleHeight = 23;
  const bubbleX = x - bubbleWidth / 2;
  const bubbleY = y - bubbleHeight - 8;

  // Warm retro status colors
  let statusDotColor = '#84a98c'; // sage
  let badgeBorder = '#52796f';
  let badgeBg = '#1c261e';

  if (agent.status === 'CODING') {
    statusDotColor = '#52b788'; // vibrant sage green
    badgeBorder = '#2d6a4f';
    badgeBg = '#14281d';
  } else if (agent.status === 'TESTING') {
    statusDotColor = '#e9c46a'; // warm amber
    badgeBorder = '#d4a373';
    badgeBg = '#282114';
  } else if (agent.status === 'DEPLOYING') {
    statusDotColor = '#f4a261'; // warm terracotta
    badgeBorder = '#e76f51';
    badgeBg = '#2d1b15';
  } else if (agent.status === 'PLANNING') {
    statusDotColor = '#a8dadc'; // soft muted teal
    badgeBorder = '#457b9d';
    badgeBg = '#162226';
  }

  const floatY = Math.sin(tick * 0.08 + x * 0.01) * 2;

  ctx.save();
  ctx.translate(0, floatY);

  // Deep olive-slate bubble background with warm sage border
  ctx.fillStyle = 'rgba(21, 29, 23, 0.95)';
  ctx.strokeStyle = isSelected ? '#e9c46a' : badgeBorder;
  ctx.lineWidth = isSelected ? 2 : 1.3;

  ctx.beginPath();
  const radius = 6;
  ctx.moveTo(bubbleX + radius, bubbleY);
  ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
  ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
  ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
  ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
  // Tail
  ctx.lineTo(x + 4, bubbleY + bubbleHeight);
  ctx.lineTo(x, bubbleY + bubbleHeight + 5);
  ctx.lineTo(x - 4, bubbleY + bubbleHeight);
  ctx.lineTo(bubbleX + radius, bubbleY + bubbleHeight);
  ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - radius);
  ctx.lineTo(bubbleX, bubbleY + radius);
  ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + radius, bubbleY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Status indicator dot
  ctx.beginPath();
  ctx.arc(bubbleX + 11, bubbleY + bubbleHeight / 2, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = statusDotColor;
  ctx.fill();

  // Agent text in warm ivory
  ctx.fillStyle = '#f8f5ee';
  ctx.fillText(text, bubbleX + 19, bubbleY + 14.5);

  // Role tag pill if selected
  if (isSelected) {
    const rolePill = `[${agent.role}] ${agent.name}`;
    ctx.font = '8px monospace';
    const pillWidth = ctx.measureText(rolePill).width + 12;
    ctx.fillStyle = badgeBg;
    ctx.fillRect(x - pillWidth / 2, bubbleY - 14, pillWidth, 12);
    ctx.strokeStyle = isSelected ? '#e9c46a' : '#84a98c';
    ctx.strokeRect(x - pillWidth / 2, bubbleY - 14, pillWidth, 12);
    ctx.fillStyle = '#f4f1ea';
    ctx.fillText(rolePill, x - pillWidth / 2 + 6, bubbleY - 5);
  }

  ctx.restore();
  ctx.restore();
}

/**
 * Draw Workstation with rich wood desk surfaces, green blotter pad, and retro accessories
 */
export function drawDesk(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  agentName: string,
  isActive: boolean,
  tick: number
): void {
  ctx.save();
  ctx.translate(x, y);

  // 1. Office Chair behind desk (dark executive leather)
  ctx.fillStyle = '#261c16';
  ctx.fillRect(-12, -26, 24, 20); // Backrest
  ctx.fillStyle = '#1c1410';
  ctx.fillRect(-14, -28, 28, 4); // Headrest
  ctx.fillStyle = '#3a2b22';
  ctx.fillRect(-10, -6, 20, 6); // Seat cushion

  // 2. Desk Table Surface (Warm Walnut / Oak Wood)
  ctx.fillStyle = '#6b4423'; // Base rich wood
  ctx.fillRect(-45, -2, 90, 36);
  ctx.fillStyle = '#87562f'; // Warm beveled top edge
  ctx.fillRect(-45, -2, 90, 4);
  ctx.fillStyle = '#4a2e16'; // Wood legs
  ctx.fillRect(-43, 34, 6, 20);
  ctx.fillRect(37, 34, 6, 20);

  // 3. Desk Blotter (Classic dark hunter green / sage leather pad)
  ctx.fillStyle = '#1e3327';
  ctx.fillRect(-35, 4, 70, 24);
  ctx.strokeStyle = '#324f3e';
  ctx.lineWidth = 1;
  ctx.strokeRect(-35, 4, 70, 24);

  // 4. Dual Monitors (Modern retro slate-beige & dark bezel)
  // Monitor 1 (Main)
  ctx.fillStyle = '#222823';
  ctx.fillRect(-32, -24, 30, 20);
  ctx.fillStyle = isActive ? '#0e1d13' : '#141815'; // Green phosphor screen
  ctx.fillRect(-30, -22, 26, 16);
  // Monitor stand
  ctx.fillStyle = '#4a534c';
  ctx.fillRect(-19, -4, 4, 7);
  ctx.fillRect(-22, 2, 10, 3);

  // Monitor 2 (Secondary)
  ctx.fillStyle = '#222823';
  ctx.fillRect(2, -24, 28, 20);
  ctx.fillStyle = isActive ? '#1e1c12' : '#141815'; // Amber phosphor screen
  ctx.fillRect(4, -22, 24, 16);
  ctx.fillStyle = '#4a534c';
  ctx.fillRect(14, -4, 4, 7);
  ctx.fillRect(11, 2, 10, 3);

  // Screen code animation
  if (isActive) {
    const codeTick = (tick % 60) / 60;
    // Monitor 1 green code lines
    ctx.fillStyle = '#52b788';
    ctx.fillRect(-28, -19, 14 + Math.sin(tick * 0.1) * 6, 1.5);
    ctx.fillStyle = '#74c69d';
    ctx.fillRect(-28, -15, 18, 1.5);
    ctx.fillStyle = '#95d5b2';
    ctx.fillRect(-28, -11, 10, 1.5);
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(-28, -7, 16, 1.5);

    // Warm glow
    ctx.save();
    ctx.fillStyle = 'rgba(82, 183, 136, 0.1)';
    ctx.beginPath();
    ctx.arc(-17, -14, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Monitor 2 amber metrics
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(6, -18, 9, 2);
    ctx.fillRect(6, -14, 14, 2);
    ctx.fillRect(6, -10, 18, 2);
    ctx.fillStyle = codeTick > 0.5 ? '#f4a261' : '#e76f51';
    ctx.fillRect(22, -20, 3, 3);
  }

  // 5. Mechanical Keyboard & Mouse
  ctx.fillStyle = '#3a443e';
  ctx.fillRect(-18, 12, 24, 8);
  ctx.fillStyle = '#dcd7cd'; // Warm beige keycaps
  ctx.fillRect(-16, 13, 20, 6);
  // Mouse
  ctx.fillStyle = '#b7b0a2';
  ctx.fillRect(10, 14, 6, 7);

  // 6. Ceramic Coffee Mug
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(26, 8, 7, 9);
  ctx.fillStyle = '#beb6a6';
  ctx.fillRect(32, 10, 3, 5);
  ctx.fillStyle = '#3f220d'; // Coffee
  ctx.fillRect(27, 8, 5, 2);

  // 7. Brass / Wood Engraved Nameplate
  ctx.fillStyle = '#261b12';
  ctx.fillRect(-28, 24, 56, 10);
  ctx.strokeStyle = '#cda15a'; // Brass gold border
  ctx.lineWidth = 1;
  ctx.strokeRect(-28, 24, 56, 10);
  ctx.fillStyle = '#e9c46a';
  ctx.font = 'bold 7px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(agentName.toUpperCase(), 0, 31);
  ctx.textAlign = 'left';

  ctx.restore();
}

/**
 * Draw Conference Room with walnut wood table, room dividers, and whiteboard
 */
export function drawConferenceRoom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number
): void {
  ctx.save();
  ctx.translate(x, y);

  // Conference Room Flooring: Warm Hardwood Parquet
  ctx.fillStyle = '#a6825c';
  ctx.fillRect(-110, -85, 220, 170);

  // Parquet plank grid lines
  ctx.strokeStyle = 'rgba(110, 80, 50, 0.35)';
  ctx.lineWidth = 1;
  for (let px = -110; px <= 110; px += 20) {
    ctx.beginPath();
    ctx.moveTo(px, -85);
    ctx.lineTo(px, 85);
    ctx.stroke();
  }
  for (let py = -85; py <= 85; py += 20) {
    ctx.beginPath();
    ctx.moveTo(-110, py);
    ctx.lineTo(110, py);
    ctx.stroke();
  }

  // Room Divider Walls (Warm Oak base + Frosted glass top)
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 3;
  ctx.strokeRect(-110, -85, 220, 170);

  // Room Header Banner
  ctx.fillStyle = '#2d1e13';
  ctx.fillRect(-105, -80, 150, 14);
  ctx.fillStyle = '#e9c46a';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText('CONFERENCE // SPRINT ARCHITECTURE', -100, -70);

  // Whiteboard on top wall
  ctx.fillStyle = '#fbf9f4';
  ctx.fillRect(-70, -82, 140, 24);
  ctx.strokeStyle = '#8c7d6b';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-70, -82, 140, 24);

  // Whiteboard flowchart
  ctx.fillStyle = '#2a6f97';
  ctx.fillRect(-55, -78, 16, 14);
  ctx.fillStyle = '#386641';
  ctx.fillRect(-15, -78, 16, 14);
  ctx.fillStyle = '#bc4749';
  ctx.fillRect(25, -78, 16, 14);
  ctx.strokeStyle = '#8c7d6b';
  ctx.beginPath();
  ctx.moveTo(-39, -71);
  ctx.lineTo(-15, -71);
  ctx.moveTo(1, -71);
  ctx.lineTo(25, -71);
  ctx.stroke();

  // Solid Walnut Oval Conference Table
  ctx.save();
  ctx.fillStyle = '#5c381e';
  ctx.beginPath();
  ctx.ellipse(0, 5, 80, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7c4d29';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Table center brass speakerphone unit
  ctx.beginPath();
  ctx.arc(0, 5, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#261c14';
  ctx.fill();
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Warm amber status beacon
  const amberAlpha = 0.25 + Math.sin(tick * 0.1) * 0.1;
  ctx.fillStyle = `rgba(233, 196, 106, ${amberAlpha})`;
  ctx.beginPath();
  ctx.arc(0, 5, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Executive Conference Chairs
  const chairAngles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];
  for (const angle of chairAngles) {
    const cx = Math.cos(angle) * 84;
    const cy = Math.sin(angle) * 44 + 5;
    ctx.fillStyle = '#2b211a';
    ctx.beginPath();
    ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#443428';
    ctx.beginPath();
    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw Server Room with dark industrial casing and status blinkers
 */
export function drawServerRoom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number,
  isActive: boolean
): void {
  ctx.save();
  ctx.translate(x, y);

  // Room perimeter wall dividers (Dark slate with glass panel)
  ctx.fillStyle = 'rgba(28, 36, 30, 0.85)';
  ctx.fillRect(-70, -90, 140, 180);
  ctx.strokeStyle = '#425446';
  ctx.lineWidth = 2;
  ctx.strokeRect(-70, -90, 140, 180);

  // Room label
  ctx.fillStyle = '#84a98c';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText('SERVER RACK CLUSTER', -60, -75);

  // 3 Server Cabinets
  const rackX = [-45, -5, 35];
  for (let r = 0; r < rackX.length; r++) {
    const rx = rackX[r];
    ctx.fillStyle = '#171e19';
    ctx.fillRect(rx - 15, -60, 30, 120);
    ctx.strokeStyle = '#2b382e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rx - 15, -60, 30, 120);

    for (let u = 0; u < 8; u++) {
      const uy = -55 + u * 14;
      ctx.fillStyle = '#222d25';
      ctx.fillRect(rx - 13, uy, 26, 11);
      ctx.fillStyle = '#111713';
      ctx.fillRect(rx - 11, uy + 2, 22, 7);

      // Blinking LEDs
      const ledTick = (tick + r * 15 + u * 7) % 40;
      const isGreen = ledTick < 22;
      const isAmber = ledTick >= 22 && ledTick < 32;

      ctx.fillStyle = isGreen ? '#52b788' : isAmber ? '#e9c46a' : '#e76f51';
      ctx.fillRect(rx - 8, uy + 4, 2.5, 2.5);

      ctx.fillStyle = (tick + u * 3) % 20 > 10 ? '#84a98c' : '#2d3d31';
      ctx.fillRect(rx - 3, uy + 4, 2.5, 2.5);

      ctx.fillStyle = '#52b788';
      ctx.fillRect(rx + 2, uy + 4, 2.5, 2.5);
    }
  }

  // Ceiling Cable Tray
  ctx.fillStyle = '#3a493e';
  ctx.fillRect(-65, -88, 130, 4);
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(-60, -87, 120, 2);

  // Warm green room wash if active
  if (isActive) {
    const glow = Math.sin(tick * 0.15) * 0.08 + 0.12;
    ctx.fillStyle = `rgba(82, 183, 136, ${glow})`;
    ctx.fillRect(-68, -88, 136, 176);
  }

  ctx.restore();
}

/**
 * Draw Coffee Break Lounge with cafe counter, espresso machine, plant, and watercooler
 */
export function drawCoffeeLounge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number,
  particles: Particle[]
): void {
  ctx.save();
  ctx.translate(x, y);

  // Floor Linoleum Tiles (retro cream & warm tan checkerboard)
  ctx.fillStyle = '#e8e4db';
  ctx.fillRect(-85, -60, 170, 120);

  const tileSize = 20;
  ctx.fillStyle = '#ded8cc';
  for (let ty = -60; ty < 60; ty += tileSize) {
    for (let tx = -85; tx < 85; tx += tileSize) {
      if ((Math.floor((tx + 85) / tileSize) + Math.floor((ty + 60) / tileSize)) % 2 === 0) {
        ctx.fillRect(tx, ty, tileSize, tileSize);
      }
    }
  }

  // Partition border
  ctx.strokeStyle = '#7c5a3d';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-85, -60, 170, 120);

  ctx.fillStyle = '#5c3a1d';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText('BREAK ROOM // CAFE', -75, -45);

  // Wooden Coffee Bar Counter
  ctx.fillStyle = '#6b4524';
  ctx.fillRect(-70, -25, 80, 50);
  ctx.fillStyle = '#8a5930';
  ctx.fillRect(-70, -25, 80, 5);

  // Chrome Espresso Machine
  ctx.fillStyle = '#9e978e';
  ctx.fillRect(-60, -42, 32, 20);
  ctx.fillStyle = '#26221d';
  ctx.fillRect(-55, -38, 22, 10);
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(-52, -35, 4, 4);
  // Portafilter
  ctx.fillStyle = '#cfc9be';
  ctx.fillRect(-50, -22, 12, 3);
  // Mug
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(-48, -19, 8, 8);

  // Water Cooler (retro off-white unit)
  ctx.fillStyle = '#ebe6dc';
  ctx.fillRect(20, -10, 22, 40);
  ctx.fillStyle = '#457b9d';
  ctx.fillRect(24, 5, 4, 6);
  ctx.fillStyle = '#e76f51';
  ctx.fillRect(32, 5, 4, 6);
  // Bottle
  ctx.save();
  ctx.fillStyle = 'rgba(69, 123, 157, 0.55)';
  ctx.beginPath();
  ctx.arc(31, -22, 11, Math.PI, 0, false);
  ctx.lineTo(42, -10);
  ctx.lineTo(20, -10);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#457b9d';
  ctx.stroke();

  if (tick % 50 > 35) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(31, -16, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Potted Office Plant (Terracotta pot & lush monstera/ficus leaves)
  ctx.fillStyle = '#c86d51'; // Terracotta
  ctx.fillRect(52, 10, 18, 22);
  ctx.fillStyle = '#a6543b';
  ctx.fillRect(50, 8, 22, 4);
  // Lush Green Leaves
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath();
  ctx.arc(61, 2, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#40916c';
  ctx.beginPath();
  ctx.arc(58, -4, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Render Warm Neutral Beige Office Carpet Floor with subtle room divider partitions
 */
export function drawOfficeFloor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // 1. Warm Neutral Beige Plush Carpet
  ctx.fillStyle = '#d6d0c2';
  ctx.fillRect(0, 0, width, height);

  // Subtle woven carpet texture / grid
  ctx.strokeStyle = 'rgba(180, 172, 156, 0.4)';
  ctx.lineWidth = 1;
  const tileSize = 32;
  for (let x = 0; x < width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Zone Floor Base Overlays
  // Engineering area subtle warm felt rug overlay
  ctx.fillStyle = 'rgba(110, 125, 114, 0.09)'; // muted sage tint
  ctx.fillRect(200, 110, 460, 180);

  // 3. Subtle Room Dividers / Cubicle Partition Half-Walls
  // Divider between Conference Room and Dev Desks
  drawWallDivider(ctx, 65, 50, 230, 50); // top wall
  drawWallDivider(ctx, 295, 50, 295, 230); // right divider

  // Divider between Break Room and Main Hall
  drawWallDivider(ctx, 50, 275, 230, 275);
  drawWallDivider(ctx, 230, 275, 230, 405);

  // Divider wall enclosing Server Cluster
  drawWallDivider(ctx, 665, 185, 815, 185);
  drawWallDivider(ctx, 665, 185, 665, 375);
}

/**
 * Helper to render an architectural office room divider with wood base and trim
 */
function drawWallDivider(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.save();
  ctx.strokeStyle = '#5a3d24'; // Wood base/trim
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Subtle interior fabric runner
  ctx.strokeStyle = '#789582'; // Muted sage fabric
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}
