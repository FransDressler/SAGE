import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-1 h-1 bg-stone-400 rounded-full animate-pulse opacity-80"></div>
        <div className="absolute top-16 right-12 w-0.5 h-0.5 bg-stone-500 rounded-full animate-twinkle opacity-60"></div>
        <div className="absolute top-24 left-1/3 w-1 h-1 bg-stone-300 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute top-40 right-1/4 w-0.5 h-0.5 bg-stone-400 rounded-full animate-twinkle opacity-50"></div>
        <div className="absolute top-48 left-20 w-1 h-1 bg-stone-500 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-60 right-8 w-0.5 h-0.5 bg-stone-300 rounded-full animate-twinkle opacity-80"></div>
        <div className="absolute top-72 left-2/3 w-1 h-1 bg-stone-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-20 left-8 w-0.5 h-0.5 bg-stone-500 rounded-full animate-twinkle opacity-70"></div>
        <div className="absolute bottom-32 right-16 w-1 h-1 bg-stone-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-40 left-1/4 w-0.5 h-0.5 bg-stone-400 rounded-full animate-twinkle opacity-60"></div>
        <div className="absolute bottom-48 right-1/3 w-1 h-1 bg-stone-500 rounded-full animate-pulse opacity-80"></div>
        <div className="absolute bottom-60 left-3/4 w-0.5 h-0.5 bg-stone-300 rounded-full animate-twinkle opacity-40"></div>
        <div className="absolute top-80 left-12 w-1 h-1 bg-stone-400 rounded-full animate-pulse opacity-90"></div>
        <div className="absolute top-96 right-24 w-0.5 h-0.5 bg-stone-500 rounded-full animate-twinkle opacity-70"></div>
        <div className="absolute bottom-80 right-12 w-1 h-1 bg-stone-300 rounded-full animate-pulse opacity-60"></div>

        <div className="absolute top-20 left-10 w-2 h-2 bg-stone-600 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-stone-500 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce opacity-30"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-stone-500 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-1/3 right-10 w-2 h-2 bg-stone-600 rounded-full animate-ping opacity-20"></div>
      </div>

      <div className="text-center space-y-10 max-w-2xl relative z-10">
        <div className="relative">
          <div className="text-9xl font-thin text-stone-800 mb-2 relative">
            404
            <div className="absolute inset-0 text-9xl font-thin bg-gradient-to-br from-bone-muted via-bone to-bone-light bg-clip-text text-transparent opacity-30 blur-sm">
              404
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-px bg-gradient-to-r from-transparent via-bone-muted to-transparent opacity-60"></div>
        </div>

        <div className="space-y-6">
          <h2 className="text-3xl font-light text-bone-light tracking-wide">
            Oops! Study session interrupted
          </h2>
          <p className="text-stone-500 text-lg leading-relaxed font-light max-w-md mx-auto">
            The page you're looking for took a study break. Let's get you back to learning something amazing!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="group relative inline-flex items-center gap-3 px-8 py-2.5 border border-bone-muted/40 rounded-full text-bone font-medium text-sm tracking-wide transition-all duration-500 hover:border-bone hover:text-bone-light hover:shadow-lg hover:shadow-bone/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-bone/0 via-bone/10 to-bone/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transition-transform group-hover:-translate-x-1 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="relative z-10">Back to Dashboard</span>
          </Link>
        </div>

        <div className="mt-16 opacity-60">
          <p className="text-stone-600 text-sm font-light italic tracking-wide">
            "Every mistake is a learning opportunity"
          </p>
        </div>
      </div>

      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(196, 184, 168, 0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-bone-muted/5 to-transparent rounded-full blur-3xl"></div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
