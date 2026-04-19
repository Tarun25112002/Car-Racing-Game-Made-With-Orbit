'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, Trophy, Zap, Shield, Pause, PlayCircle } from 'lucide-react';
import { GameEngine } from './GameEngine';

export default function RacingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'paused' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('orbit-racer-highscore');
    if (saved) setHighScore(parseInt(saved));

    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, {
        onScoreUpdate: (s) => setScore(s),
        onGameOver: (finalScore) => {
          setGameState('gameover');
          if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem('orbit-racer-highscore', finalScore.toString());
          }
        },
        onSpeedUpdate: (v) => setSpeed(v)
      });
    }

    return () => {
      engineRef.current?.stop();
    };
  }, [highScore]);

  const startGame = () => {
    setGameState('playing');
    engineRef.current?.start();
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      engineRef.current?.pause();
    } else if (gameState === 'paused') {
      setGameState('playing');
      engineRef.current?.resume();
    }
  };

  const restartGame = () => {
    setGameState('playing');
    engineRef.current?.restart();
  };

  return (
    <div className="relative w-full aspect-[16/9] glass-panel overflow-hidden group">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        width={1280}
        height={720}
      />

      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Score</p>
              <p className="text-2xl font-mono font-bold leading-none">{score.toLocaleString().padStart(6, '0')}</p>
            </div>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-3">
            <Zap className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Speed</p>
              <p className="text-2xl font-mono font-bold leading-none">{Math.floor(speed * 10)} <span className="text-sm font-normal text-slate-500">KM/H</span></p>
            </div>
          </div>
        </div>

        <div className="glass-panel px-4 py-2">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">High Score</p>
          <p className="text-xl font-mono font-bold text-indigo-300">{highScore.toLocaleString().padStart(6, '0')}</p>
        </div>
      </div>

      {/* Screens */}
      {gameState === 'idle' && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/50">
              <PlayCircle className="w-12 h-12 text-white fill-white/20" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Ready to Race?</h2>
            <button onClick={startGame} className="btn-primary mx-auto">
              <Play className="w-5 h-5" /> START ENGINE
            </button>
          </div>
        </div>
      )}

      {gameState === 'paused' && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6">PAUSED</h2>
            <button onClick={togglePause} className="btn-primary mx-auto">
              <Play className="w-5 h-5" /> RESUME
            </button>
          </div>
        </div>
      )}

      {gameState === 'gameover' && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
          <div className="text-center animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-6xl font-black text-white mb-2">CRASHED!</h2>
            <p className="text-xl text-red-200 mb-8">Final Score: {score.toLocaleString()}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={restartGame} className="btn-primary bg-white text-slate-900 hover:bg-slate-100">
                <RotateCcw className="w-5 h-5" /> TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Hint */}
      {gameState === 'playing' && (
        <button 
          onClick={togglePause}
          className="absolute bottom-6 right-6 w-12 h-12 glass-panel flex items-center justify-center hover:bg-slate-800 transition-colors pointer-events-auto"
        >
          <Pause className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}