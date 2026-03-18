export default function Header() {
  return (
    <header className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          AI Governance Stakeholder Map
        </h1>
      </div>
      <p className="mt-1 ml-[19px] text-base text-slate-400 font-medium">By Gabriel Sherman</p>
      <p className="mt-3 ml-[19px] max-w-2xl text-slate-500 text-sm leading-relaxed">
        This map plots 270+ players in the AI governance ecosystem on a Power &times; Interest grid.
        Scores were assigned by AI based on publicly available information and should be treated as
        approximate starting points, not definitive rankings.
      </p>
    </header>
  );
}
