import { Flame } from 'lucide-react';

interface BonusProps {
  x: number;
  y: number;
}

export const Bonus = ({ x, y }: BonusProps) => {
  return (
    <div
      className="absolute z-15 w-[32px] h-[32px] rounded-full flex items-center justify-center"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        background: `
          radial-gradient(60% 60% at 50% 35%, hsl(30, 100%, 85%), transparent 65%),
          radial-gradient(100% 100% at 50% 70%, hsl(25, 100%, 60%), transparent 62%),
          radial-gradient(100% 100% at 50% 70%, hsl(15, 100%, 50%), transparent 62%)
        `,
        boxShadow: `
          0 0 18px hsl(25, 100%, 60% / 0.8),
          0 0 32px hsl(15, 100%, 50% / 0.6)
        `
      }}
    >
      <Flame 
        size={16} 
        className="text-white drop-shadow-sm" 
        fill="currentColor"
      />
    </div>
  );
};