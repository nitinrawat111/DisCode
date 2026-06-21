function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1 text-sm text-indigo-300">
          DisCode Frontend
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          React + Vite + Tailwind + TypeScript
        </h1>
        <p className="mt-4 max-w-xl text-slate-300">
          Frontend workspace is set up with ESLint and Prettier using
          monorepo-aligned config, plus React-specific lint rules.
        </p>
      </section>
    </main>
  );
}

export default App;
