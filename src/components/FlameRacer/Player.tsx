interface PlayerProps {
  x: number;
  y: number;
}

export const Player = ({ x, y }: PlayerProps) => {
  return (
    <div
      className="absolute z-20 w-[42px] h-[60px] origin-bottom animate-glow"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <img 
        src="/lovable-uploads/4a1807b9-ae14-4689-80c9-18c8258f160f.png" 
        alt="Flame Player" 
        className="w-full h-full object-contain filter drop-shadow-lg"
        style={{
          filter: 'drop-shadow(0 0 12px hsl(var(--flame-core) / 0.6)) drop-shadow(0 0 24px hsl(var(--flame-hot) / 0.4))'
        }}
      />
    </div>
  );
};