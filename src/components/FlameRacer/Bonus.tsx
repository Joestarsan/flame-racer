import { memo } from 'react';
import { Flame } from 'lucide-react';

interface BonusProps {
  x: number;
  y: number;
}

export const Bonus = memo(({ x, y }: BonusProps) => {
  return (
    <div
      className="absolute z-15 w-[32px] h-[32px] rounded-full flex items-center justify-center 
                 bg-orange-500 will-change-transform"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        boxShadow: '0 0 16px hsl(25, 100%, 60% / 0.6)'
      }}
    >
      <Flame 
        size={16} 
        className="text-white" 
        fill="currentColor"
      />
    </div>
  );
});