import { Agent, Dimensions } from '../../lib/types';

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

export const DEFAULT_DIMENSIONS: Dimensions = { width: 32, height: 32 };

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

  // Subtle natural idle breathing animation
  const breatheBob = !isWalking ? Math.sin(tick * 0.08) * 0.8 : 0;
  const walkBob = isWalking ? Math.sin(tick * 0.25) * 2.8 : 0;
  const legOffset = isWalking ? Math.sin(tick * 0.25) * 3.5 : 0;
  const typeBob = isCoding ? Math.sin(tick * 0.4) * 1.2 : 0;

  ctx.save();
  ctx.translate(x, y + walkBob + typeBob + breatheBob);

  // 1. Selection / Hover Halo (Warm Amber / Muted Sage Glow)
  if (isSelected || isHovered) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 14, 18, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? 'rgba(233, 196, 106, 0.45)' : 'rgba(132, 169, 140, 0.35)';
    ctx.shadowColor = isSelected ? '#e9c46a' : '#84a98c';
    ctx.shadowBlur = isSelected ? 12 : 6;
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#d4a373' : '#52796f';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();
  } else {
    // Subtle tactile floor shadow under character feet
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 14, 14, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(30, 25, 20, 0.25)';
    ctx.fill();
    ctx.restore();
  }

  // Direction facing
  const dx = agent.targetCoordinates.x - agent.coordinates.x;
  if (dx < -1) {
    ctx.scale(-1, 1);
  }

  // 2. Legs / Shoes
  ctx.fillStyle = '#261c16'; // Classic leather brown shoes
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
    ctx.fillStyle = '#9e2a2b'; // Classic burgundy tie
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

  // 7. Clean, Crisp Status Speech Tag overhead
  drawSpeechBubble(ctx, agent, x, y - 28 + walkBob, tick, isSelected);
}

/**
 * Draw animated overhead speech tag with smooth pill styling
 */
function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  tick: number,
  isSelected: boolean
): void {
  const actionText = agent.currentAction || agent.name;
  ctx.save();

  ctx.font = '600 9px "JetBrains Mono", Menlo, Consolas, monospace';
  const textWidth = ctx.measureText(actionText).width;
  const bubbleWidth = Math.max(textWidth + 24, 76);
  const bubbleHeight = 22;
  const bubbleX = x - bubbleWidth / 2;
  const bubbleY = y - bubbleHeight - 6;

  // Soft indicator color
  let dotColor = '#84a98c';
  let badgeBorder = '#2d382e';
  if (agent.status === 'CODING') {
    dotColor = '#52b788';
    badgeBorder = '#3e6047';
  } else if (agent.status === 'TESTING') {
    dotColor = '#e9c46a';
    badgeBorder = '#7c6332';
  } else if (agent.status === 'DEPLOYING') {
    dotColor = '#f4a261';
    badgeBorder = '#8a5340';
  } else if (agent.status === 'PLANNING') {
    dotColor = '#a8dadc';
    badgeBorder = '#3d6174';
  }

  // Subtle gentle float
  const floatY = Math.sin(tick * 0.05 + x * 0.01) * 1.2;

  ctx.save();
  ctx.translate(0, floatY);

  // Deep tactile slate-olive bubble background
  ctx.fillStyle = 'rgba(22, 26, 22, 0.94)';
  ctx.strokeStyle = isSelected ? '#e9c46a' : badgeBorder;
  ctx.lineWidth = isSelected ? 1.6 : 1.2;

  // Rounded pill
  ctx.beginPath();
  const radius = 5;
  ctx.moveTo(bubbleX + radius, bubbleY);
  ctx.lineTo(bubbleX + bubbleWidth - radius, bubbleY);
  ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + radius);
  ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - radius);
  ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - radius, bubbleY + bubbleHeight);
  // Pointer tail
  ctx.lineTo(x + 4, bubbleY + bubbleHeight);
  ctx.lineTo(x, bubbleY + bubbleHeight + 4);
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
  ctx.arc(bubbleX + 10, bubbleY + bubbleHeight / 2, 3, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  // Agent text in warm ivory
  ctx.fillStyle = '#faf7ee';
  ctx.fillText(actionText, bubbleX + 17, bubbleY + 14);

  // Role tag pill if selected
  if (isSelected) {
    const rolePill = `[${agent.role}] ${agent.name}`;
    ctx.font = '8px monospace';
    const pillWidth = ctx.measureText(rolePill).width + 10;
    ctx.fillStyle = '#1c221d';
    ctx.fillRect(x - pillWidth / 2, bubbleY - 14, pillWidth, 12);
    ctx.strokeStyle = '#e9c46a';
    ctx.strokeRect(x - pillWidth / 2, bubbleY - 14, pillWidth, 12);
    ctx.fillStyle = '#faf7ee';
    ctx.fillText(rolePill, x - pillWidth / 2 + 5, bubbleY - 5);
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

  // 1. Office Chair behind desk
  ctx.fillStyle = '#261c16';
  ctx.fillRect(-12, -26, 24, 20);
  ctx.fillStyle = '#1c1410';
  ctx.fillRect(-14, -28, 28, 4);
  ctx.fillStyle = '#3a2b22';
  ctx.fillRect(-10, -6, 20, 6);

  // 2. Desk Table Surface (Warm Walnut / Oak Wood)
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(-45, -2, 90, 36);
  ctx.fillStyle = '#87562f';
  ctx.fillRect(-45, -2, 90, 4);
  ctx.fillStyle = '#4a2e16';
  ctx.fillRect(-43, 34, 6, 20);
  ctx.fillRect(37, 34, 6, 20);

  // 3. Desk Blotter (Dark hunter green / sage leather pad)
  ctx.fillStyle = '#1e3327';
  ctx.fillRect(-35, 4, 70, 24);
  ctx.strokeStyle = '#324f3e';
  ctx.lineWidth = 1;
  ctx.strokeRect(-35, 4, 70, 24);

  // 4. Dual Monitors
  ctx.fillStyle = '#222823';
  ctx.fillRect(-32, -24, 30, 20);
  ctx.fillStyle = isActive ? '#0e1d13' : '#141815';
  ctx.fillRect(-30, -22, 26, 16);
  ctx.fillStyle = '#4a534c';
  ctx.fillRect(-19, -4, 4, 7);
  ctx.fillRect(-22, 2, 10, 3);

  ctx.fillStyle = '#222823';
  ctx.fillRect(2, -24, 28, 20);
  ctx.fillStyle = isActive ? '#1e1c12' : '#141815';
  ctx.fillRect(4, -22, 24, 16);
  ctx.fillStyle = '#4a534c';
  ctx.fillRect(14, -4, 4, 7);
  ctx.fillRect(11, 2, 10, 3);

  // Screen code animation
  if (isActive) {
    const codeTick = (tick % 60) / 60;
    ctx.fillStyle = '#52b788';
    ctx.fillRect(-28, -19, 14 + Math.sin(tick * 0.1) * 6, 1.5);
    ctx.fillStyle = '#74c69d';
    ctx.fillRect(-28, -15, 18, 1.5);
    ctx.fillStyle = '#95d5b2';
    ctx.fillRect(-28, -11, 10, 1.5);
    ctx.fillStyle = '#e9c46a';
    ctx.fillRect(-28, -7, 16, 1.5);

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
  ctx.fillStyle = '#dcd7cd';
  ctx.fillRect(-16, 13, 20, 6);
  ctx.fillStyle = '#b7b0a2';
  ctx.fillRect(10, 14, 6, 7);

  // 6. Ceramic Coffee Mug
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(26, 8, 7, 9);
  ctx.fillStyle = '#beb6a6';
  ctx.fillRect(32, 10, 3, 5);
  ctx.fillStyle = '#3f220d';
  ctx.fillRect(27, 8, 5, 2);

  // 7. Brass / Wood Engraved Nameplate
  ctx.fillStyle = '#261b12';
  ctx.fillRect(-28, 24, 56, 10);
  ctx.strokeStyle = '#cda15a';
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
  tick: number,
  dimensions?: Dimensions
): void {
  const dims = dimensions || { width: 220, height: 170 };
  const halfW = dims.width / 2;
  const halfH = dims.height / 2;

  ctx.save();
  ctx.translate(x, y);

  // Flooring: Hardwood Parquet
  ctx.fillStyle = '#a6825c';
  ctx.fillRect(-halfW, -halfH, dims.width, dims.height);

  ctx.strokeStyle = 'rgba(110, 80, 50, 0.35)';
  ctx.lineWidth = 1;
  for (let px = -halfW; px <= halfW; px += 20) {
    ctx.beginPath();
    ctx.moveTo(px, -halfH);
    ctx.lineTo(px, halfH);
    ctx.stroke();
  }
  for (let py = -halfH; py <= halfH; py += 20) {
    ctx.beginPath();
    ctx.moveTo(-halfW, py);
    ctx.lineTo(halfW, py);
    ctx.stroke();
  }

  // Room Divider Walls
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 3;
  ctx.strokeRect(-halfW, -halfH, dims.width, dims.height);

  // Banner
  ctx.fillStyle = '#2d1e13';
  ctx.fillRect(-halfW + 5, -halfH + 5, 145, 14);
  ctx.fillStyle = '#e9c46a';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText('CONFERENCE // PLANNING', -halfW + 10, -halfH + 15);

  // Whiteboard
  ctx.fillStyle = '#fbf9f4';
  ctx.fillRect(-70, -halfH + 3, 140, 24);
  ctx.strokeStyle = '#8c7d6b';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-70, -halfH + 3, 140, 24);

  // Diagram on board
  ctx.fillStyle = '#2a6f97';
  ctx.fillRect(-55, -halfH + 7, 16, 14);
  ctx.fillStyle = '#386641';
  ctx.fillRect(-15, -halfH + 7, 16, 14);
  ctx.fillStyle = '#bc4749';
  ctx.fillRect(25, -halfH + 7, 16, 14);

  // Table
  ctx.save();
  ctx.fillStyle = '#5c381e';
  ctx.beginPath();
  ctx.ellipse(0, 5, 80, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7c4d29';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Brass speakerphone
  ctx.beginPath();
  ctx.arc(0, 5, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#261c14';
  ctx.fill();
  ctx.strokeStyle = '#e9c46a';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const amberAlpha = 0.25 + Math.sin(tick * 0.1) * 0.1;
  ctx.fillStyle = `rgba(233, 196, 106, ${amberAlpha})`;
  ctx.beginPath();
  ctx.arc(0, 5, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Chairs
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
 * Draw Server Room with status blinkers
 */
export function drawServerRoom(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tick: number,
  isActive: boolean,
  dimensions?: Dimensions
): void {
  const dims = dimensions || { width: 140, height: 180 };
  const halfW = dims.width / 2;
  const halfH = dims.height / 2;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(28, 36, 30, 0.85)';
  ctx.fillRect(-halfW, -halfH, dims.width, dims.height);
  ctx.strokeStyle = '#425446';
  ctx.lineWidth = 2;
  ctx.strokeRect(-halfW, -halfH, dims.width, dims.height);

  ctx.fillStyle = '#84a98c';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText('SERVER RACK CLUSTER', -halfW + 10, -halfH + 15);

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

  ctx.fillStyle = '#3a493e';
  ctx.fillRect(-65, -88, 130, 4);
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(-60, -87, 120, 2);

  if (isActive) {
    const glow = Math.sin(tick * 0.15) * 0.08 + 0.12;
    ctx.fillStyle = `rgba(82, 183, 136, ${glow})`;
    ctx.fillRect(-halfW + 2, -halfH + 2, dims.width - 4, dims.height - 4);
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
  particles: Particle[],
  dimensions?: Dimensions
): void {
  const dims = dimensions || { width: 170, height: 120 };
  const halfW = dims.width / 2;
  const halfH = dims.height / 2;

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#e8e4db';
  ctx.fillRect(-halfW, -halfH, dims.width, dims.height);

  const tileSize = 20;
  ctx.fillStyle = '#ded8cc';
  for (let ty = -halfH; ty < halfH; ty += tileSize) {
    for (let tx = -halfW; tx < halfW; tx += tileSize) {
      if ((Math.floor((tx + halfW) / tileSize) + Math.floor((ty + halfH) / tileSize)) % 2 === 0) {
        ctx.fillRect(tx, ty, tileSize, tileSize);
      }
    }
  }

  ctx.strokeStyle = '#7c5a3d';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-halfW, -halfH, dims.width, dims.height);

  ctx.fillStyle = '#5c3a1d';
  ctx.font = 'bold 8.5px monospace';
  ctx.fillText('BREAK ROOM // CAFE', -halfW + 10, -halfH + 15);

  // Counter
  ctx.fillStyle = '#6b4524';
  ctx.fillRect(-70, -25, 80, 50);
  ctx.fillStyle = '#8a5930';
  ctx.fillRect(-70, -25, 80, 5);

  // Espresso Machine
  ctx.fillStyle = '#9e978e';
  ctx.fillRect(-60, -42, 32, 20);
  ctx.fillStyle = '#26221d';
  ctx.fillRect(-55, -38, 22, 10);
  ctx.fillStyle = '#e9c46a';
  ctx.fillRect(-52, -35, 4, 4);
  ctx.fillStyle = '#cfc9be';
  ctx.fillRect(-50, -22, 12, 3);
  ctx.fillStyle = '#faf8f4';
  ctx.fillRect(-48, -19, 8, 8);

  // Water Cooler
  ctx.fillStyle = '#ebe6dc';
  ctx.fillRect(20, -10, 22, 40);
  ctx.fillStyle = '#457b9d';
  ctx.fillRect(24, 5, 4, 6);
  ctx.fillStyle = '#e76f51';
  ctx.fillRect(32, 5, 4, 6);
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

  // Potted Office Plant
  ctx.fillStyle = '#c86d51';
  ctx.fillRect(52, 10, 18, 22);
  ctx.fillStyle = '#a6543b';
  ctx.fillRect(50, 8, 22, 4);
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
 * Render Warm Neutral Beige Office Canvas Floor (#E7E3D8)
 */
export function drawOfficeFloor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void {
  // Warm neutral office canvas floor (#E7E3D8)
  ctx.fillStyle = '#e7e3d8';
  ctx.fillRect(0, 0, width, height);

  // Subtle woven carpet texture / grid
  ctx.strokeStyle = 'rgba(195, 188, 172, 0.4)';
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

  // Engineering area subtle warm felt rug overlay
  ctx.fillStyle = 'rgba(110, 125, 114, 0.08)';
  ctx.fillRect(200, 110, 460, 180);

  // Subtle Room Dividers / Cubicle Partition Half-Walls
  drawWallDivider(ctx, 65, 50, 230, 50);
  drawWallDivider(ctx, 295, 50, 295, 230);
  drawWallDivider(ctx, 50, 275, 230, 275);
  drawWallDivider(ctx, 230, 275, 230, 405);
  drawWallDivider(ctx, 665, 185, 815, 185);
  drawWallDivider(ctx, 665, 185, 665, 375);
}

function drawWallDivider(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.save();
  ctx.strokeStyle = '#5a3d24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.strokeStyle = '#789582';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}
