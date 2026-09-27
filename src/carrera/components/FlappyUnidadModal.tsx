import React, { useEffect, useRef, useState } from 'react';
import { UnidadVeterinariaEmblem } from './UnidadVeterinariaLogo';
import { Trophy, RotateCcw, X, Play, Volume2, VolumeX, Sparkles, Globe, CheckCircle2, Award, Gamepad2, User, RefreshCw } from 'lucide-react';
import { submitScore, subscribeToLeaderboard } from '../lib/firebase';
import type { LeaderboardEntry } from '../lib/firebase';

interface FlappyUnidadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HIGH_SCORE_KEY = 'flappy_unidad_highscore_v1';

type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'extreme';

interface DifficultyConfig {
  name: string;
  gravity: number;
  jump: number;
  pipeSpeed: number;
  pipeGap: number;
  spawnRate: number;
  hitPadding: number;
  movingPipes: boolean;
  badge: string;
  color: string;
}

const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    name: 'Tranquilo',
    gravity: 0.20,
    jump: -5.5,
    pipeSpeed: 1.6,
    pipeGap: 175,
    spawnRate: 110,
    hitPadding: 5,
    movingPipes: false,
    badge: '🌱',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  normal: {
    name: 'Normal',
    gravity: 0.24,
    jump: -5.9,
    pipeSpeed: 2.0,
    pipeGap: 155,
    spawnRate: 98,
    hitPadding: 4,
    movingPipes: false,
    badge: '📚',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  hard: {
    name: 'Difícil',
    gravity: 0.28,
    jump: -6.3,
    pipeSpeed: 2.5,
    pipeGap: 135,
    spawnRate: 85,
    hitPadding: 2,
    movingPipes: false,
    badge: '⚡',
    color: 'bg-amber-100 text-amber-900 border-amber-400 font-bold',
  },
  extreme: {
    name: 'Examen Final 💀',
    gravity: 0.32,
    jump: -6.6,
    pipeSpeed: 2.9,
    pipeGap: 120,
    spawnRate: 72,
    hitPadding: 1,
    movingPipes: true,
    badge: '🔥',
    color: 'bg-rose-100 text-rose-900 border-rose-400 font-extrabold',
  },
};

export const FlappyUnidadModal: React.FC<FlappyUnidadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER'>('IDLE');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('hard');
  const [isMuted, setIsMuted] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
    } catch {
      return 0;
    }
  });

  // Modal view tabs: game vs online leaderboard
  const [activeModalTab, setActiveModalTab] = useState<'game' | 'ranking'>('game');
  const [playerName, setPlayerName] = useState(() => {
    try {
      return localStorage.getItem('flappy_unidad_player_name') || '';
    } catch {
      return '';
    }
  });
  const [nameError, setNameError] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [rankingFilter, setRankingFilter] = useState<'all' | 'easy' | 'normal' | 'hard' | 'extreme'>('all');
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);

  // Subscribe to real-time online leaderboard from Firestore
  useEffect(() => {
    if (!isOpen) return;
    setIsLeaderboardLoading(true);
    const unsubscribe = subscribeToLeaderboard(rankingFilter, 30, (entries) => {
      setLeaderboardEntries(entries);
      setIsLeaderboardLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen, rankingFilter]);

  // Auto-submit score and update ranking filter according to the difficulty played on GameOver
  useEffect(() => {
    if (gameState === 'GAMEOVER') {
      // Establish ranking filter to the level played
      setRankingFilter(difficulty);

      // Auto submit score if player has name and points
      const trimmedName = playerName.trim();
      if (score > 0 && trimmedName) {
        setIsSubmittingScore(true);
        submitScore(trimmedName, score, difficulty).then((success) => {
          setIsSubmittingScore(false);
          if (success) {
            setScoreSubmitted(true);
          }
        });
      }
    }
  }, [gameState]);

  // Web Audio Context for Sound Effects
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playJumpSound = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.error(e);
    }
  };

  const playScoreSound = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Bright cheerful double chime / coin reward sound
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);

        gain.gain.setValueAtTime(0.15, now + index * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.12);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const playLevelUpSound = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Fanfare arpeggio for level up
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0.2, now + index * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + 0.15);
      });
    } catch (e) {
      console.error(e);
    }
  };

  const playHitSound = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {
      console.error(e);
    }
  };

  // Game loop references
  const animFrameId = useRef<number | null>(null);
  const birdPos = useRef({ y: 250, velocity: 0 });
  const pipes = useRef<Array<{ x: number; topHeight: number; gap: number; passed: boolean; dy?: number }>>([]);
  const frameCount = useRef(0);
  const currentScore = useRef(0);

  // Constants & Difficulty Settings
  const CANVAS_WIDTH = 380;
  const CANVAS_HEIGHT = 540;

  // Adaptación móvil: el lienzo (380x540) se escala para entrar en el ancho/alto del teléfono.
  const [escala, setEscala] = useState(1);
  useEffect(() => {
    if (!isOpen) return;
    const medir = () => {
      const ancho = Math.min(window.innerWidth, 384);
      const alto = window.innerHeight - 150; // encabezado + barra de puntaje + pie + márgenes seguros
      setEscala(Math.max(0.55, Math.min(1, ancho / CANVAS_WIDTH, alto / CANVAS_HEIGHT)));
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [isOpen]);
  const BIRD_RADIUS = 13;
  const BIRD_X = 80;

  const currentConfig = DIFFICULTY_PRESETS[difficulty];

  // Render bird image cache
  const emblemImage = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    // High-precision SVG Data URL matching official Unidad Veterinaria logo
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
      <circle cx="250" cy="250" r="240" fill="#00823B" />
      <g fill="#FFFFFF" stroke="#FFFFFF">
        <path d="M 250 80 C 255 80 262 90 265 105 C 285 100 295 105 305 125 C 310 135 320 155 350 165 C 390 170 415 180 435 220 C 455 260 445 290 415 325 C 385 355 340 340 310 335 C 290 365 270 380 250 385 C 230 380 210 365 190 335 C 160 340 115 355 85 325 C 55 290 45 260 65 220 C 85 180 110 170 150 165 C 180 155 190 135 195 125 C 205 105 215 100 235 105 C 238 90 245 80 250 80 Z" stroke-width="12" stroke-linejoin="round" />
      </g>
      <g fill="#00823B" stroke="#00823B" stroke-width="2">
        <path d="M 230 110 L 240 130 L 250 115 L 260 130 L 270 110 L 280 145 L 270 160 L 230 160 L 220 145 Z" />
        <path d="M 210 170 C 205 200 200 260 215 315 L 230 325 L 228 280 L 220 220 C 220 190 225 175 230 170 Z" />
        <path d="M 290 170 C 295 200 300 260 285 315 L 270 325 L 272 280 L 280 220 C 280 190 275 175 270 170 Z" />
        <ellipse cx="232" cy="328" rx="6" ry="8" />
        <ellipse cx="268" cy="328" rx="6" ry="8" />
        <path d="M 195 180 C 160 190 110 220 100 250 C 95 265 95 275 102 280 C 105 270 115 255 130 245 C 150 235 180 225 198 215 Z" />
        <ellipse cx="140" cy="218" rx="5" ry="3" />
        <path d="M 305 180 C 340 190 390 220 400 250 C 405 265 405 275 398 280 C 395 270 385 255 370 245 C 350 235 320 225 302 215 Z" />
        <ellipse cx="360" cy="218" rx="5" ry="3" />
      </g>
    </svg>`;

    const img = new Image();
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
    emblemImage.current = img;
  }, []);

  const jump = () => {
    if (gameState === 'IDLE' || gameState === 'GAMEOVER') {
      if (!playerName.trim()) {
        setNameError(true);
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
        return;
      }
    }

    setNameError(false);
    playJumpSound();
    const jumpVal = currentConfig.jump;
    if (gameState === 'IDLE') {
      setGameState('PLAYING');
      resetGame();
      birdPos.current.velocity = jumpVal;
    } else if (gameState === 'PLAYING') {
      birdPos.current.velocity = jumpVal;
    } else if (gameState === 'GAMEOVER') {
      setGameState('PLAYING');
      resetGame();
      birdPos.current.velocity = jumpVal;
    }
  };

  const resetGame = () => {
    birdPos.current = { y: 220, velocity: 0 };
    pipes.current = [];
    frameCount.current = 0;
    currentScore.current = 0;
    setScore(0);
    setScoreSubmitted(false);
  };

  // Keyboard handler
  useEffect(() => {
    if (!isOpen || activeModalTab !== 'game') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't jump if focused inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gameState, difficulty, activeModalTab]);

  // Main Canvas Game Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = DIFFICULTY_PRESETS[difficulty];

    const updateAndDraw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      bgGradient.addColorStop(0, difficulty === 'extreme' ? '#fce7f3' : '#e6f4ea');
      bgGradient.addColorStop(0.7, difficulty === 'extreme' ? '#f43f5e' : '#c2e7cd');
      bgGradient.addColorStop(1, difficulty === 'extreme' ? '#881337' : '#a8dfb8');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw clouds / decoration
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(60, 80, 25, 0, Math.PI * 2);
      ctx.arc(85, 75, 30, 0, Math.PI * 2);
      ctx.arc(110, 80, 25, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(280, 120, 20, 0, Math.PI * 2);
      ctx.arc(300, 115, 25, 0, Math.PI * 2);
      ctx.arc(320, 120, 20, 0, Math.PI * 2);
      ctx.fill();

      // Ground grass
      const groundY = CANVAS_HEIGHT - 35;
      ctx.fillStyle = difficulty === 'extreme' ? '#4c0519' : '#006030';
      ctx.fillRect(0, groundY, CANVAS_WIDTH, 35);
      ctx.fillStyle = difficulty === 'extreme' ? '#9f1239' : '#0d4a2c';
      ctx.fillRect(0, groundY, CANVAS_WIDTH, 8);

      if (gameState === 'PLAYING') {
        frameCount.current++;

        // Calculate dynamic difficulty scaling based on difficulty level & current score
        const currentScoreVal = currentScore.current;
        const currentSpeed = Math.min(
          config.pipeSpeed + Math.floor(currentScoreVal / 4) * 0.15,
          config.pipeSpeed + 1.2
        );
        const currentGap = Math.max(
          config.pipeGap - Math.floor(currentScoreVal / 4) * 2.5,
          105
        );
        const currentSpawnRate = Math.max(
          Math.floor(config.spawnRate - Math.floor(currentScoreVal / 4) * 2),
          58
        );

        // Bird Physics
        birdPos.current.velocity += config.gravity;
        if (birdPos.current.velocity > 7.5) {
          birdPos.current.velocity = 7.5;
        }
        birdPos.current.y += birdPos.current.velocity;

        // Ceiling check
        if (birdPos.current.y - BIRD_RADIUS < 0) {
          birdPos.current.y = BIRD_RADIUS;
          birdPos.current.velocity = 0.5;
        }

        // Spawn Pipes
        if (frameCount.current % currentSpawnRate === 0) {
          const minHeight = 55;
          const maxHeight = Math.max(groundY - currentGap - 55, minHeight + 10);
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
          const isMoving = config.movingPipes && Math.random() > 0.35;

          pipes.current.push({
            x: CANVAS_WIDTH,
            topHeight,
            gap: currentGap,
            passed: false,
            dy: isMoving ? (Math.random() > 0.5 ? 0.9 : -0.9) : 0,
          });
        }

        // Update Pipes & Collision
        pipes.current.forEach((pipe) => {
          pipe.x -= currentSpeed;

          // Vertical pipe oscillation in extreme mode
          if (pipe.dy) {
            pipe.topHeight += pipe.dy;
            if (pipe.topHeight < 40 || pipe.topHeight + pipe.gap > groundY - 30) {
              pipe.dy = -pipe.dy;
            }
          }

          // Score check
          if (!pipe.passed && pipe.x + 50 < BIRD_X) {
            pipe.passed = true;
            currentScore.current += 1;
            const newScore = currentScore.current;
            setScore(newScore);

            // Level up chime every 5 points
            if (newScore > 0 && newScore % 5 === 0) {
              playLevelUpSound();
            } else {
              playScoreSound();
            }

            // Update High score
            if (newScore > highScore) {
              setHighScore(newScore);
              try {
                localStorage.setItem(HIGH_SCORE_KEY, newScore.toString());
              } catch (e) {
                console.error(e);
              }
            }
          }
        });

        // Remove off-screen pipes
        pipes.current = pipes.current.filter((p) => p.x > -60);

        // Check Collisions
        const birdY = birdPos.current.y;

        // Ground hit
        if (birdY + BIRD_RADIUS >= groundY) {
          playHitSound();
          setGameState('GAMEOVER');
        }

        // Pipe collisions with difficulty-adjusted hit padding
        const hitPadding = config.hitPadding;
        pipes.current.forEach((p) => {
          const pipeWidth = 50;
          if (
            BIRD_X + BIRD_RADIUS - hitPadding > p.x &&
            BIRD_X - BIRD_RADIUS + hitPadding < p.x + pipeWidth
          ) {
            // Check top pipe OR bottom pipe
            if (
              birdY - BIRD_RADIUS + hitPadding < p.topHeight ||
              birdY + BIRD_RADIUS - hitPadding > p.topHeight + p.gap
            ) {
              playHitSound();
              setGameState('GAMEOVER');
            }
          }
        });
      }

      // Draw Pipes
      pipes.current.forEach((p) => {
        const pipeWidth = 50;
        const pipeColor = difficulty === 'extreme' ? '#be123c' : '#0d4a2c';
        const pipeBorder = difficulty === 'extreme' ? '#881337' : '#004d25';

        // Top Pipe
        ctx.fillStyle = pipeColor;
        ctx.strokeStyle = pipeBorder;
        ctx.lineWidth = 3;

        ctx.fillRect(p.x, 0, pipeWidth, p.topHeight);
        ctx.strokeRect(p.x, 0, pipeWidth, p.topHeight);

        // Pipe Cap Top
        ctx.fillRect(p.x - 4, p.topHeight - 18, pipeWidth + 8, 18);
        ctx.strokeRect(p.x - 4, p.topHeight - 18, pipeWidth + 8, 18);

        // Bottom Pipe
        const bottomY = p.topHeight + p.gap;
        const bottomHeight = groundY - bottomY;

        ctx.fillRect(p.x, bottomY, pipeWidth, bottomHeight);
        ctx.strokeRect(p.x, bottomY, pipeWidth, bottomHeight);

        // Pipe Cap Bottom
        ctx.fillRect(p.x - 4, bottomY, pipeWidth + 8, 18);
        ctx.strokeRect(p.x - 4, bottomY, pipeWidth + 8, 18);
      });

      // Draw Bird (Logo)
      const birdY = birdPos.current.y;
      const angle = Math.min(Math.max(birdPos.current.velocity * 3, -25), 45) * (Math.PI / 180);

      ctx.save();
      ctx.translate(BIRD_X, birdY);
      ctx.rotate(angle);

      if (emblemImage.current && emblemImage.current.complete) {
        ctx.drawImage(
          emblemImage.current,
          -BIRD_RADIUS - 2,
          -BIRD_RADIUS - 2,
          (BIRD_RADIUS + 2) * 2,
          (BIRD_RADIUS + 2) * 2
        );
      } else {
        // Fallback circle
        ctx.beginPath();
        ctx.arc(0, 0, BIRD_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#0d4a2c';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();
      }

      ctx.restore();

      // Render Loop trigger
      if (gameState === 'PLAYING') {
        animFrameId.current = requestAnimationFrame(updateAndDraw);
      }
    };

    if (gameState === 'PLAYING') {
      animFrameId.current = requestAnimationFrame(updateAndDraw);
    } else {
      updateAndDraw(); // Single static render for idle / gameover
    }

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isOpen, gameState]);

  if (!isOpen) return null;

  return (
    <div className="carrera-overlay flex items-stretch sm:items-center justify-center bg-black/75 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Flappy Unidad">
      <div className="bg-white sm:rounded-3xl overflow-y-auto overflow-x-hidden w-full sm:max-w-sm h-full sm:h-auto sm:max-h-full shadow-2xl sm:border border-emerald-500/30 flex flex-col items-center relative">
        
        {/* Header Bar */}
        <div className="w-full bg-[#0d4a2c] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-emerald-600">
          <div className="flex items-center gap-2">
            <UnidadVeterinariaEmblem className="w-6 h-6 shrink-0" />
            <div>
              <h2 className="text-xs font-black tracking-tight flex items-center gap-1 font-serif">
                Flappy Unidad <Sparkles className="w-3 h-3 text-amber-300" />
              </h2>
            </div>
          </div>

          {/* View Mode Toggle Tabs */}
          <div className="flex items-center gap-1 bg-emerald-900/60 p-0.5 rounded-xl border border-emerald-500/40">
            <button
              onClick={() => setActiveModalTab('game')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeModalTab === 'game'
                  ? 'bg-white text-emerald-900 shadow-2xs font-extrabold'
                  : 'text-emerald-100 hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Juego</span>
            </button>

            <button
              onClick={() => setActiveModalTab('ranking')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 relative ${
                activeModalTab === 'ranking'
                  ? 'bg-amber-400 text-amber-950 shadow-2xs font-extrabold'
                  : 'text-amber-200 hover:bg-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Ranking</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title={isMuted ? "Activar sonido" : "Silenciar sonido"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-200" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-200" />}
            </button>

            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              title="Cerrar juego"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Modal Content: Game Tab vs Ranking Tab */}
        {activeModalTab === 'game' ? (
          <>
            {/* High score and Score bar */}
            <div className="w-full bg-emerald-50 px-3.5 py-2 flex items-center justify-between text-xs font-bold text-emerald-950 border-b border-emerald-200/60">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Puntaje:</span>
                <span className="text-base font-black font-mono text-[#0d4a2c]">{score}</span>
              </div>

              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] ${currentConfig.color}`}>
                <span>{currentConfig.badge} {currentConfig.name}</span>
              </div>

              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full border border-amber-300/50">
                <Trophy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Récord:</span>
                <span className="font-mono font-black">{highScore}</span>
              </div>
            </div>

            {/* Game Canvas Container */}
            <div className="bg-slate-900 w-full flex justify-center shrink-0">
            <div style={{ width: CANVAS_WIDTH * escala, height: CANVAS_HEIGHT * escala }}>
            <div
              onClick={jump}
              className="relative cursor-pointer select-none touch-none w-full flex items-center justify-center bg-slate-900"
              style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: escala === 1 ? undefined : `scale(${escala})`, transformOrigin: 'top left' }}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="block"
              />

              {/* Overlay: IDLE State */}
              {gameState === 'IDLE' && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-center p-4 text-white space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 p-2 backdrop-blur-md border border-white/30 animate-bounce">
                    <UnidadVeterinariaEmblem className="w-full h-full" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black font-serif">
                      Flappy Unidad
                    </h3>
                    <p className="text-[11px] text-emerald-100 mt-0.5 max-w-[230px]">
                      Toca o presiona <strong>Espacio</strong> para esquivar tuberías y sumar puntos.
                    </p>
                  </div>

                  {/* Player Name Input Required */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-black/50 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 w-full max-w-[310px] space-y-1 text-left"
                  >
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                      👤 Nombre o Apodo (Para el Ranking)
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={playerName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPlayerName(val);
                          if (val.trim()) setNameError(false);
                          try {
                            localStorage.setItem('flappy_unidad_player_name', val);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        placeholder="Escribí tu nombre..."
                        maxLength={25}
                        className={`w-full bg-white text-slate-900 pl-8 pr-3 py-1.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 placeholder:font-normal placeholder:text-slate-400 ${
                          nameError
                            ? 'border-rose-500 ring-2 ring-rose-500/80 animate-bounce'
                            : 'border-white/30 focus:ring-emerald-400'
                        }`}
                      />
                    </div>
                    {nameError && (
                      <p className="text-[10px] text-rose-300 font-extrabold text-center pt-0.5">
                        ⚠️ Ingresá tu nombre para poder competir.
                      </p>
                    )}
                  </div>

                  {/* Difficulty Selector */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/20 w-full max-w-[310px] space-y-1"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block text-center">
                      Dificultad
                    </span>
                    <div className="grid grid-cols-2 gap-1">
                      {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((key) => {
                        const preset = DIFFICULTY_PRESETS[key];
                        const isSelected = difficulty === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setDifficulty(key)}
                            className={`px-2 py-1 rounded-xl text-[11px] font-bold transition-all border flex items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-white text-slate-900 border-white shadow-md scale-102 ring-2 ring-emerald-400/50'
                                : 'bg-white/10 text-white/80 border-white/10 hover:bg-white/20'
                            }`}
                          >
                            <span>{preset.badge}</span>
                            <span className="truncate">{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      jump();
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#0d4a2c] text-white font-extrabold text-xs shadow-lg hover:bg-emerald-600 active:scale-95 transition-all border border-emerald-400/30"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    ¡Jugar ({currentConfig.name})!
                  </button>
                </div>
              )}

              {/* Overlay: GAMEOVER State */}
              {gameState === 'GAMEOVER' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 text-white space-y-2.5 animate-in zoom-in-95 duration-150">
                  <div className="bg-white text-slate-900 rounded-3xl p-4 w-full max-w-[310px] shadow-2xl border border-slate-200 space-y-2.5 text-left">
                    <div className="text-center">
                      <span className="text-xs font-extrabold uppercase text-rose-600 tracking-wider">
                        ¡Game Over!
                      </span>
                      <p className="text-3xl font-black font-mono text-[#0d4a2c] mt-0.5">
                        {score} <span className="text-xs text-slate-500 font-sans">pts</span>
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Modo: <strong className="text-slate-800">{currentConfig.badge} {currentConfig.name}</strong> • Máximo: <strong className="text-slate-800">{highScore} pts</strong>
                      </p>
                    </div>

                    {/* Auto Submit Score & Ranking Link for Difficulty Level */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-amber-50/90 p-3 rounded-2xl border border-amber-200 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-amber-950">
                        <span className="flex items-center gap-1 font-serif">
                          <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          Ranking - Nivel {currentConfig.badge} {currentConfig.name}
                        </span>
                        {isSubmittingScore ? (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Guardando...
                          </span>
                        ) : scoreSubmitted ? (
                          <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Registrado
                          </span>
                        ) : (
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                            En vivo
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-600 font-medium">
                        {score > 0 ? (
                          <>
                            Puntaje de <strong className="text-slate-900">{playerName || 'Jugador'}</strong> guardado automáticamente en el ranking de <strong>{currentConfig.name}</strong>.
                          </>
                        ) : (
                          <>
                            Conseguí al menos 1 punto para calificar en el ranking de <strong>{currentConfig.name}</strong>.
                          </>
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() => setActiveModalTab('ranking')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-amber-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-98"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-900" />
                        <span>Ver Tabla de Ranking ({currentConfig.name}) 🏆</span>
                      </button>
                    </div>

                    {/* Quick difficulty switch on gameover */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200 space-y-1"
                    >
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block text-center">Cambiar Dificultad</span>
                      <div className="grid grid-cols-2 gap-1">
                        {(Object.keys(DIFFICULTY_PRESETS) as DifficultyLevel[]).map((key) => {
                          const preset = DIFFICULTY_PRESETS[key];
                          const isSelected = difficulty === key;
                          return (
                            <button
                              key={`go-${key}`}
                              type="button"
                              onClick={() => {
                                setDifficulty(key);
                                setRankingFilter(key);
                              }}
                              className={`px-1.5 py-1 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs font-black'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span>{preset.badge}</span>
                              <span className="truncate">{preset.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          jump();
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#0d4a2c] text-white font-extrabold text-xs shadow-md hover:bg-emerald-600 transition-all active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reintentar
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalTab('ranking');
                        }}
                        className="px-3 py-2.5 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs hover:bg-amber-200 transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        Ranking
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
            </div>
          </>
        ) : (
          /* Ranking Tab Panel View */
          <div className="w-full flex flex-col bg-slate-50 flex-1 min-h-0" style={{ minHeight: Math.round((CANVAS_HEIGHT + 35) * escala) }}>
            {/* Top Bar inside Ranking tab */}
            <div className="p-3 bg-white border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                    Ranking Global Online <Globe className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>

                <button
                  onClick={() => setActiveModalTab('game')}
                  className="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                >
                  <Gamepad2 className="w-3.5 h-3.5" />
                  Jugar
                </button>
              </div>

              {/* Player Name Config */}
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap pl-1">
                  Tu apodo:
                </span>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlayerName(val);
                    try {
                      localStorage.setItem('flappy_unidad_player_name', val);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  placeholder="Escribí tu apodo..."
                  maxLength={25}
                  className="bg-white px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filter Chips by Difficulty */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                {[
                  { key: 'all', label: 'Todos', badge: '🌐' },
                  { key: 'easy', label: 'Tranquilo', badge: '🌱' },
                  { key: 'normal', label: 'Normal', badge: '📚' },
                  { key: 'hard', label: 'Difícil', badge: '⚡' },
                  { key: 'extreme', label: 'Examen Final', badge: '🔥' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRankingFilter(f.key as any)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                      rankingFilter === f.key
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{f.badge}</span>
                    <span>{f.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ranking List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {isLeaderboardLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                  <p className="text-xs font-medium">Cargando puntajes globales...</p>
                </div>
              ) : leaderboardEntries.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 space-y-2 my-auto">
                  <Award className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">¡Aún no hay puntajes en esta categoría!</p>
                  <p className="text-[11px] text-slate-500">
                    Jugá una partida y sé el primero en subir a la tabla global.
                  </p>
                  <button
                    onClick={() => setActiveModalTab('game')}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d4a2c] text-white font-extrabold text-xs shadow-xs hover:bg-emerald-600 transition-all"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" />
                    ¡Jugar Ahora!
                  </button>
                </div>
              ) : (
                leaderboardEntries.map((entry, idx) => {
                  const rank = idx + 1;
                  const isCurrentUser = playerName.trim().toLowerCase() === entry.playerName.trim().toLowerCase();
                  const preset = DIFFICULTY_PRESETS[entry.difficulty] || DIFFICULTY_PRESETS.hard;

                  return (
                    <div
                      key={entry.id || idx}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                        isCurrentUser
                          ? 'bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400'
                          : rank === 1
                          ? 'bg-amber-50/80 border-amber-300'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Rank & Name */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0">
                          {rank === 1 ? (
                            <span className="text-base">🥇</span>
                          ) : rank === 2 ? (
                            <span className="text-base">🥈</span>
                          ) : rank === 3 ? (
                            <span className="text-base">🥉</span>
                          ) : (
                            <span className="text-slate-500 font-mono text-xs">#{rank}</span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-slate-800 truncate">
                              {entry.playerName}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                                Tú
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {preset.badge} {preset.name}
                          </span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <span className="text-base font-black font-mono text-[#0d4a2c] block">
                          {entry.score} <span className="text-[10px] font-sans text-slate-400">pts</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Footer info in modal */}
        <div className="w-full bg-slate-100 p-2.5 text-center text-[11px] text-slate-500 font-medium border-t border-slate-200">
          Usa la tecla <kbd className="bg-white border px-1.5 py-0.5 rounded text-slate-700 font-mono shadow-2xs">Espacio</kbd> o toca para saltar
        </div>

      </div>
    </div>
  );
};
