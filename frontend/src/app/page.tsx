export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 text-2xl font-bold">
          W
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Wyxan Web Browser</h1>
        <p className="text-slate-400 text-sm mb-6">
          Full-Stack Database-Backed Browser Engine &bull; Next.js &bull; NestJS &bull; MongoDB
        </p>
        <div className="text-xs text-slate-500 border-t border-slate-700/80 pt-4">
          Authoritative Backend Navigation Engine Initializing...
        </div>
      </div>
    </main>
  );
}
