import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const FestiveAtmosphere: React.FC = () => {
  const { activeTheme, particlesEnabled } = useTheme();

  if (!particlesEnabled || activeTheme.particleType === 'none') {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      {/* DIWALI PARTICLES: Floating golden glowing diyas & flame sparks */}
      {activeTheme.particleType === 'diya' && (
        <div className="relative w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={`diya-${i}`}
              className="absolute animate-float-slow text-amber-400 opacity-60 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] select-none text-base sm:text-xl"
              style={{
                left: `${(i * 8.5) % 94 + 2}%`,
                top: `${(i * 15 + 10) % 85}%`,
                animationDelay: `${i * 0.7}s`,
                animationDuration: `${6 + (i % 5)}s`,
              }}
            >
              🪔
            </div>
          ))}
          {[...Array(15)].map((_, i) => (
            <div
              key={`spark-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse opacity-70 filter blur-[0.5px]"
              style={{
                left: `${(i * 6.5) % 96}%`,
                top: `${(i * 12 + 5) % 90}%`,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* HOLI PARTICLES: Subtle colorful gulal powder sparkles */}
      {activeTheme.particleType === 'gulal' && (
        <div className="relative w-full h-full">
          {[...Array(16)].map((_, i) => {
            const colors = ['bg-rose-400', 'bg-amber-400', 'bg-fuchsia-400', 'bg-emerald-400', 'bg-sky-400'];
            const color = colors[i % colors.length];
            return (
              <div
                key={`gulal-${i}`}
                className={`absolute w-2 h-2 rounded-full ${color} opacity-40 animate-ping filter blur-[1px]`}
                style={{
                  left: `${(i * 6) % 95 + 2}%`,
                  top: `${(i * 11 + 4) % 92}%`,
                  animationDuration: `${3 + (i % 4)}s`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* AKSHAYA TRITIYA & DHANTERAS: Falling & floating prosperity gold coins */}
      {activeTheme.particleType === 'coins' && (
        <div className="relative w-full h-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={`coin-${i}`}
              className="absolute animate-float-slow text-yellow-500 opacity-65 filter drop-shadow-[0_0_6px_rgba(234,179,8,0.7)] select-none text-base sm:text-lg"
              style={{
                left: `${(i * 10) % 92 + 3}%`,
                top: `${(i * 18 + 8) % 88}%`,
                animationDelay: `${i * 0.9}s`,
                animationDuration: `${7 + (i % 4)}s`,
              }}
            >
              🪙
            </div>
          ))}
        </div>
      )}

      {/* ROYAL WEDDING VIVAHA: Floating romantic rose petals & gold sparkles */}
      {activeTheme.particleType === 'petals' && (
        <div className="relative w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={`petal-${i}`}
              className="absolute animate-float-slow text-rose-500 opacity-55 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.5)] select-none text-sm sm:text-base"
              style={{
                left: `${(i * 8.2) % 94 + 2}%`,
                top: `${(i * 14 + 12) % 86}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${8 + (i % 3)}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>
      )}

      {/* MIDNIGHT SAPPHIRE & DIAMOND GALA: Twinkling celestial diamond starbursts */}
      {activeTheme.particleType === 'diamonds' && (
        <div className="relative w-full h-full">
          {[...Array(12)].map((_, i) => (
            <div
              key={`diamond-${i}`}
              className="absolute animate-pulse text-sky-400 opacity-60 filter drop-shadow-[0_0_8px_rgba(56,189,248,0.8)] select-none text-sm sm:text-base"
              style={{
                left: `${(i * 8.5) % 92 + 3}%`,
                top: `${(i * 16 + 6) % 90}%`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: `${2.5 + (i % 3)}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
