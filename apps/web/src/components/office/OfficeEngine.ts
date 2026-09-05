import { Agent, Coordinates, OfficeState } from '../../lib/types';
import {
  drawCharacter,
  drawDesk,
  drawConferenceRoom,
  drawServerRoom,
  drawCoffeeLounge,
  drawOfficeFloor,
  Particle,
} from './sprites';

export class OfficeEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private state: OfficeState | null = null;
  private animFrameId: number | null = null;
  private tick: number = 0;

  // Viewport camera controls
  public cameraX: number = 0;
  public cameraY: number = 0;
  public zoom: number = 1.0;
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;

  // Selection & Hover
  public selectedAgentId: string | null = 'pm';
  public hoveredAgentId: string | null = null;
  private onSelectAgentCallback?: (agentId: string) => void;

  // Particles
  private particles: Particle[] = [];

  // Lighting options
  public enableLighting: boolean = true;
  public enableGrid: boolean = true;

  constructor(canvas: HTMLCanvasElement, onSelectAgent?: (agentId: string) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Failed to obtain 2D canvas rendering context');
    this.ctx = context;
    this.onSelectAgentCallback = onSelectAgent;

    this.setupEvents();
    this.centerView();
    this.startLoop();
  }

  public updateState(state: OfficeState): void {
    this.state = state;
  }

  public setSelectedAgent(agentId: string | null): void {
    this.selectedAgentId = agentId;
  }

  public centerView(): void {
    const rect = this.canvas.getBoundingClientRect();
    // Office virtual world size is 900 x 540
    this.zoom = Math.min(rect.width / 920, rect.height / 560, 1.3);
    this.cameraX = (rect.width - 860 * this.zoom) / 2;
    this.cameraY = (rect.height - 480 * this.zoom) / 2;
  }

  public zoomIn(): void {
    this.zoom = Math.min(this.zoom * 1.2, 2.5);
  }

  public zoomOut(): void {
    this.zoom = Math.max(this.zoom / 1.2, 0.5);
  }

  public resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
  }

  private setupEvents(): void {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  private handleMouseDown = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = (mouseX - this.cameraX) / this.zoom;
    const worldY = (mouseY - this.cameraY) / this.zoom;

    // Check hit test on agents
    const hitAgent = this.findAgentAt(worldX, worldY);
    if (hitAgent) {
      this.selectedAgentId = hitAgent.id;
      if (this.onSelectAgentCallback) {
        this.onSelectAgentCallback(hitAgent.id);
      }
      return;
    }

    // Otherwise initiate pan drag
    this.isDragging = true;
    this.dragStartX = mouseX - this.cameraX;
    this.dragStartY = mouseY - this.cameraY;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.isDragging) {
      this.cameraX = mouseX - this.dragStartX;
      this.cameraY = mouseY - this.dragStartY;
      return;
    }

    // Check hover
    const worldX = (mouseX - this.cameraX) / this.zoom;
    const worldY = (mouseY - this.cameraY) / this.zoom;
    const hitAgent = this.findAgentAt(worldX, worldY);

    if (hitAgent) {
      this.hoveredAgentId = hitAgent.id;
      this.canvas.style.cursor = 'pointer';
    } else {
      this.hoveredAgentId = null;
      this.canvas.style.cursor = 'grab';
    }
  };

  private handleMouseUp = () => {
    this.isDragging = false;
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(this.zoom * zoomFactor, 0.45), 2.8);

    // Zoom centered on cursor
    this.cameraX = mouseX - (mouseX - this.cameraX) * (newZoom / this.zoom);
    this.cameraY = mouseY - (mouseY - this.cameraY) * (newZoom / this.zoom);
    this.zoom = newZoom;
  };

  private findAgentAt(x: number, y: number): Agent | null {
    if (!this.state) return null;
    const radius = 24;
    for (const agent of Object.values(this.state.agents)) {
      const dx = agent.coordinates.x - x;
      const dy = agent.coordinates.y - y;
      if (Math.hypot(dx, dy) < radius) {
        return agent;
      }
    }
    return null;
  }

  private updateParticles(): void {
    // 1. Spawn coffee steam particle from espresso machine { x: 140, y: 340 - 25 }
    if (this.tick % 8 === 0 && this.particles.length < 50) {
      this.particles.push({
        x: 140 - 45 + (Math.random() * 6 - 3),
        y: 340 - 25,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.6 - Math.random() * 0.5,
        alpha: 0.6,
        size: 2.5 + Math.random() * 2,
        color: 'rgba(255, 255, 255,',
        maxLife: 60,
        life: 0,
      });
    }

    // 2. Spawn code keystroke spark when coder is active
    if (this.state) {
      const coder = this.state.agents.coder;
      if (coder && coder.status === 'CODING' && this.tick % 6 === 0) {
        this.particles.push({
          x: coder.coordinates.x + (Math.random() * 20 - 10),
          y: coder.coordinates.y - 12,
          vx: (Math.random() - 0.5) * 1.2,
          vy: -1.2 - Math.random() * 1.0,
          alpha: 0.9,
          size: 2,
          color: Math.random() > 0.5 ? 'rgba(56, 189, 248,' : 'rgba(52, 211, 153,',
          maxLife: 35,
          life: 0,
        });
      }
    }

    // Update & remove expired particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (const p of this.particles) {
      ctx.fillStyle = `${p.color} ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  private drawDynamicLighting(ctx: CanvasRenderingContext2D): void {
    if (!this.enableLighting) return;

    ctx.save();
    // Warm incandescent desk lamps & overhead tungsten glow
    const desks = [
      { x: 260, y: 190, color: 'rgba(233, 196, 106, 0.09)' }, // PM desk (warm amber)
      { x: 420, y: 190, color: 'rgba(132, 169, 140, 0.09)' }, // Coder desk (muted sage)
      { x: 580, y: 190, color: 'rgba(212, 163, 115, 0.09)' }, // Reviewer desk (warm beige)
    ];

    for (const desk of desks) {
      const grad = ctx.createRadialGradient(desk.x, desk.y, 10, desk.x, desk.y, 85);
      grad.addColorStop(0, desk.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(desk.x - 85, desk.y - 85, 170, 170);
    }

    // Server room soft sage-green indicator glow
    const sGrad = ctx.createRadialGradient(740, 280, 15, 740, 280, 110);
    sGrad.addColorStop(0, 'rgba(82, 183, 136, 0.12)');
    sGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sGrad;
    ctx.fillRect(630, 170, 220, 220);

    ctx.restore();
  }

  private render = (): void => {
    this.tick++;
    this.updateParticles();

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Clear canvas with deep olive-slate perimeter
    this.ctx.save();
    this.ctx.fillStyle = '#111813';
    this.ctx.fillRect(0, 0, width, height);

    // Apply Camera Transform
    this.ctx.translate(this.cameraX, this.cameraY);
    this.ctx.scale(this.zoom, this.zoom);

    // 1. Draw Office Floor & Room Zones
    drawOfficeFloor(this.ctx, 880, 480);

    // 2. Draw Rooms & Structures
    // Conference room (top left)
    drawConferenceRoom(this.ctx, 180, 140, this.tick);

    // Coffee Lounge (bottom left)
    drawCoffeeLounge(this.ctx, 140, 340, this.tick, this.particles);

    // Server Room (top right)
    const isServerActive =
      this.state?.agents.devops?.status === 'DEPLOYING' ||
      this.state?.agents.devops?.status === 'TESTING';
    drawServerRoom(this.ctx, 740, 280, this.tick, isServerActive || false);

    // 3. Draw Work Desks (4 Desks)
    const deskConfigs = [
      { x: 260, y: 190, name: 'Michael (PM)', id: 'pm' },
      { x: 420, y: 190, name: 'Jim (Coder)', id: 'coder' },
      { x: 580, y: 190, name: 'Dwight (QA)', id: 'reviewer' },
    ];

    for (const d of deskConfigs) {
      const agent = this.state?.agents[d.id];
      const isActive = agent ? agent.status !== 'IDLE' : false;
      drawDesk(this.ctx, d.x, d.y, d.name, isActive, this.tick);
    }

    // 4. Draw Particles (steam, sparks)
    this.drawParticles(this.ctx);

    // 5. Draw Dynamic Lighting
    this.drawDynamicLighting(this.ctx);

    // 6. Draw Agents with status bubbles
    if (this.state?.agents) {
      const sortedAgents = Object.values(this.state.agents).sort(
        (a, b) => a.coordinates.y - b.coordinates.y
      );

      for (const agent of sortedAgents) {
        const isSelected = this.selectedAgentId === agent.id;
        const isHovered = this.hoveredAgentId === agent.id;
        drawCharacter(this.ctx, agent, this.tick, isSelected, isHovered);
      }
    }

    this.ctx.restore();

    this.animFrameId = requestAnimationFrame(this.render);
  };

  public startLoop(): void {
    if (!this.animFrameId) {
      this.animFrameId = requestAnimationFrame(this.render);
    }
  }

  public stopLoop(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public destroy(): void {
    this.stopLoop();
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
  }
}
