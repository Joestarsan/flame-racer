import { memo } from 'react';

interface PlayerProps {
  x: number;
  y: number;
}

export const Player = memo(({ x, y }: PlayerProps) => {
  return (
    <div
      className="absolute z-20 w-[42px] h-[60px] will-change-transform"
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
    >
      <img 
        src="/lovable-uploads/4a1807b9-ae14-4689-80c9-18c8258f160f.png" 
        alt="Flame Player" 
        className="w-full h-full object-contain"
        style={{
          filter: 'drop-shadow(0 0 8px hsl(var(--flame-core) / 0.5))'
        }}
      />
    </div>
  );
});