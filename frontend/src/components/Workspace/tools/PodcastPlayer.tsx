type Props = {
  audioFile: string;
  audioFilename: string;
  topic: string;
  onClose: () => void;
  onChatAbout?: () => void;
};

export default function PodcastPlayer({ audioFile, audioFilename, topic, onClose, onChatAbout }: Props) {
  return (
    <div className="relative h-full flex flex-col">
      <div className="sticky top-0 z-10 self-end m-2 flex gap-1">
        {onChatAbout && (
          <button onClick={onChatAbout} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors backdrop-blur-sm" title="Chat about this">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
          </button>
        )}
        <button onClick={onClose} className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors backdrop-blur-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scroll px-4 pb-4">
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-900/30 border border-purple-800/40 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-stone-200 mb-1">{topic}</h3>
            <p className="text-xs text-stone-500">AI-generated podcast</p>
          </div>

          <audio controls className="w-full" src={audioFile} />

          <a
            href={audioFile}
            download={audioFilename}
            className="block py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm font-medium text-center transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
