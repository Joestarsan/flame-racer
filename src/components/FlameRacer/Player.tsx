interface PlayerProps {
  x: number;
  y: number;
}

export const Player = ({ x, y }: PlayerProps) => {
  return (
    <div
      className="absolute z-20 w-[42px] h-[60px] rounded-xl ember-glow origin-bottom animate-glow"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        background: `
          radial-gradient(40% 45% at 50% 25%, hsl(var(--foreground) / 0.85), transparent 62%),
          radial-gradient(75% 70% at 50% 70%, hsl(var(--flame-ember)), transparent 64%),
          radial-gradient(75% 70% at 50% 70%, hsl(var(--flame-core)), transparent 64%)
        `,
        boxShadow: `
          0 0 20px hsl(var(--flame-core) / 0.55),
          0 0 40px hsl(var(--flame-hot) / 0.35)
        `
      }}
    />
  );
};