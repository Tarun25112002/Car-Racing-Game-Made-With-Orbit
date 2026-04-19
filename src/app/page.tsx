import RacingGame from '@/components/Game/RacingGame';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            ORBIT RACER
          </h1>
          <p className="text-slate-400 text-lg">Dodge traffic, collect points, and survive the neon highway.</p>
        </div>
        
        <RacingGame />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
              <span className="text-indigo-400 font-bold">A/D</span>
            </div>
            <h3 className="font-semibold mb-1">Steer</h3>
            <p className="text-sm text-slate-400">Use A/D or Left/Right arrows to move your car.</p>
          </div>
          <div className="card flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
              <span className="text-indigo-400 font-bold">W/S</span>
            </div>
            <h3 className="font-semibold mb-1">Speed</h3>
            <p className="text-sm text-slate-400">Control your acceleration and braking.</p>
          </div>
          <div className="card flex flex-col items-center text-center">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-3">
              <span className="text-indigo-400 font-bold">ESC</span>
            </div>
            <h3 className="font-semibold mb-1">Pause</h3>
            <p className="text-sm text-slate-400">Pause the game at any time to take a breather.</p>
          </div>
        </div>
      </div>
    </main>
  );
}