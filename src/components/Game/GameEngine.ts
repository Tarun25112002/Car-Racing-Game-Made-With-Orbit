type GameCallbacks = {
  onScoreUpdate: (score: number) => void;
  onGameOver: (score: number) => void;
  onSpeedUpdate: (speed: number) => void;
};

interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private callbacks: GameCallbacks;
  private animationFrameId: number | null = null;
  
  // Game State
  private isRunning = false;
  private isPaused = false;
  private score = 0;
  private gameSpeed = 5;
  private lastTime = 0;
  
  // Player
  private player: Entity = {
    x: 0,
    y: 0,
    width: 50,
    height: 90,
    speed: 0,
    color: '#6366f1'
  };
  
  // Entities
  private enemies: Entity[] = [];
  private particles: any[] = [];
  private roadOffset = 0;
  
  // Input
  private keys: Record<string, boolean> = {};

  constructor(canvas: HTMLCanvasElement, callbacks: GameCallbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.callbacks = callbacks;
    
    this.player.x = canvas.width / 2 - this.player.width / 2;
    this.player.y = canvas.height - 150;

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
    if (e.key === 'Escape') this.isPaused ? this.resume() : this.pause();
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.score = 0;
    this.gameSpeed = 5;
    this.enemies = [];
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }

  public restart() {
    this.stop();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.start();
  }

  private spawnEnemy() {
    const lanes = [350, 480, 610, 740, 870];
    const lane = lanes[Math.floor(Math.random() * lanes.length)];
    
    // Check if lane is already occupied nearby
    const tooClose = this.enemies.some(e => Math.abs(e.y) < 200 && e.x === lane - 25);
    if (tooClose) return;

    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899'];
    
    this.enemies.push({
      x: lane - 25,
      y: -100,
      width: 50,
      height: 90,
      speed: this.gameSpeed * (0.5 + Math.random() * 0.5),
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  private update(deltaTime: number) {
    if (!this.isRunning || this.isPaused) return;

    // Increase difficulty
    this.gameSpeed += 0.001 * deltaTime;
    this.score += Math.floor(this.gameSpeed / 2);
    this.callbacks.onScoreUpdate(this.score);
    this.callbacks.onSpeedUpdate(this.gameSpeed);

    // Road movement
    this.roadOffset = (this.roadOffset + this.gameSpeed) % 100;

    // Player movement
    const moveSpeed = 0.6 * deltaTime;
    if ((this.keys['a'] || this.keys['arrowleft']) && this.player.x > 320) {
      this.player.x -= moveSpeed;
    }
    if ((this.keys['d'] || this.keys['arrowright']) && this.player.x < 910) {
      this.player.x += moveSpeed;
    }
    if ((this.keys['w'] || this.keys['arrowup']) && this.gameSpeed < 20) {
      this.gameSpeed += 0.01;
    }
    if ((this.keys['s'] || this.keys['arrowdown']) && this.gameSpeed > 5) {
      this.gameSpeed -= 0.02;
    }

    // Enemies
    if (Math.random() < 0.02) this.spawnEnemy();

    this.enemies.forEach((enemy, index) => {
      enemy.y += (this.gameSpeed - enemy.speed * 0.5);
      
      // Collision detection
      if (
        this.player.x < enemy.x + enemy.width &&
        this.player.x + this.player.width > enemy.x &&
        this.player.y < enemy.y + enemy.height &&
        this.player.y + this.player.height > enemy.y
      ) {
        this.gameOver();
      }

      // Remove off-screen
      if (enemy.y > this.canvas.height) {
        this.enemies.splice(index, 1);
      }
    });
  }

  private gameOver() {
    this.isRunning = false;
    this.callbacks.onGameOver(this.score);
  }

  private draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Road
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(300, 0, 680, canvas.height);
    
    // Road Lines
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([40, 40]);
    ctx.lineDashOffset = -this.roadOffset * 2;
    ctx.lineWidth = 4;
    
    for (let i = 1; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(300 + (680 / 5) * i, 0);
      ctx.lineTo(300 + (680 / 5) * i, canvas.height);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Road Borders
    ctx.fillStyle = '#6366f1';
    ctx.fillRect(290, 0, 10, canvas.height);
    ctx.fillRect(980, 0, 10, canvas.height);

    // Draw Player Car
    this.drawCar(this.player.x, this.player.y, this.player.color, true);

    // Draw Enemies
    this.enemies.forEach(enemy => {
      this.drawCar(enemy.x, enemy.y, enemy.color, false);
    });
  }

  private drawCar(x: number, y: number, color: string, isPlayer: boolean) {
    const { ctx } = this;
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 5, y + 5, 50, 90);

    // Body
    ctx.fillStyle = color;
    this.roundRect(ctx, x, y, 50, 90, 8);
    
    // Roof/Windshield
    ctx.fillStyle = isPlayer ? '#1e1b4b' : '#334155';
    ctx.fillRect(x + 8, y + 25, 34, 35);
    
    // Headlights
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 5, 10, 5);
    ctx.fillRect(x + 35, y + 5, 10, 5);

    // Tail lights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x + 5, y + 80, 10, 5);
    ctx.fillRect(x + 35, y + 80, 10, 5);

    if (isPlayer) {
      // Glow effect for player
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 50, 90);
      ctx.shadowBlur = 0;
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  }

  private loop = (time: number) => {
    if (!this.isRunning || this.isPaused) return;

    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };
}