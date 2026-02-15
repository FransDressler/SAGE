export default function MobileHeader() {
  return (
    <header className="lg:hidden bg-stone-900 border border-stone-900 rounded-2xl p-4 mb-6 mt-4 flex items-center justify-between">
      <img src="/logo.png" alt="logo" className="w-8 h-auto rounded-full" />
      <h2 className="text-2xl font-bold tracking-[0.06em] bg-clip-text text-transparent" style={{ fontFamily: "'Permanent Marker', cursive", backgroundImage: 'radial-gradient(ellipse at 15% 50%, #E8956A 0%, transparent 50%), radial-gradient(ellipse at 85% 40%, #6A8CB8 0%, transparent 50%), linear-gradient(135deg, #E8A06A 0%, #D07850 30%, #C85A5A 60%, #5878A8 100%)' }}>S.A.G.E.</h2>
      <button className="p-2 hover:bg-stone-900 rounded-xl duration-300 transition-all" aria-label="Menu">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    </header>
  );
}