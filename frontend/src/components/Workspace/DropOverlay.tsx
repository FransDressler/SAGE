export default function DropOverlay({ icon, message }: { icon: "document" | "image"; message: string }) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm"
      style={{ animation: "fadeIn 150ms ease" }}
    >
      <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-stone-500 px-10 py-8">
        {icon === "document" ? (
          <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ) : (
          <svg className="w-10 h-10 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
          </svg>
        )}
        <span className="text-xs font-medium uppercase tracking-widest text-stone-400">
          {message}
        </span>
      </div>
    </div>
  );
}
