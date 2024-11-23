// ... existing imports ...
import { Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';

const toSentenceCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function MusicPlayer() {
  // ... existing state and hooks ...

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-gradient-to-b from-zinc-900 via-zinc-900 to-black rounded-2xl border border-zinc-800/50 shadow-2xl">
      {/* Current Track Display */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 blur-xl"></div>
        <div className="relative p-6 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10">
          <h2 className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            {toSentenceCase(tracks[currentTrack]?.track || '')}
          </h2>
        </div>
      </div>

      {/* Dynamic Waveform */}
      <div className="relative h-24 mb-8">
        <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-4">
          {[...Array(128)].map((_, i) => (
            <div
              key={i}
              className="w-0.5 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transform-gpu"
              style={{
                height: `${15 + Math.random() * 70}%`,
                animation: `waveform ${0.2 + Math.random() * 0.3}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.01}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => currentTrack > 0 && handleTrackChange(currentTrack - 1)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            disabled={currentTrack === 0}
          >
            <SkipBack className="w-6 h-6" />
          </button>

          <button
            onClick={handlePlay}
            className="p-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <Play className="w-8 h-8 text-black" fill="black" />
          </button>

          <button
            onClick={() => currentTrack < tracks.length - 1 && handleTrackChange(currentTrack + 1)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            disabled={currentTrack === tracks.length - 1}
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar rounded-xl bg-zinc-900/50 p-4">
        {tracks.map((track, index) => (
          <div
            key={index}
            onClick={() => handleTrackChange(index)}
            className={`group relative p-4 rounded-lg cursor-pointer transition-all duration-300
              ${currentTrack === index 
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/20' 
                : 'hover:bg-white/5'
              }`}
          >
            <div className="flex items-center gap-4">
              <div className={`relative w-10 h-10 rounded-lg overflow-hidden
                ${currentTrack === index 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-zinc-800'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {currentTrack === index ? (
                    <div className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className="w-0.5 h-4 bg-black rounded-full"
                          style={{
                            animation: `equalizer 0.5s ease-in-out infinite alternate`,
                            animationDelay: `${i * 0.15}s`
                          }}
                        ></div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400">{index + 1}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className={`truncate text-sm font-medium
                  ${currentTrack === index 
                    ? 'text-emerald-400' 
                    : 'text-zinc-300 group-hover:text-white'
                  }`}
                >
                  {toSentenceCase(track.track)}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {Math.floor(Math.random() * 3) + 2}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                </p>
              </div>

              {currentTrack === index && (
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                  NOW PLAYING
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes waveform {
          0% {
            transform: scaleY(0.3);
          }
          100% {
            transform: scaleY(1);
          }
        }

        @keyframes equalizer {
          0% {
            height: 4px;
          }
          100% {
            height: 16px;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}