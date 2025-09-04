interface BonusProps {
  x: number;
  y: number;
}

export const Bonus = ({ x, y }: BonusProps) => {
  return (
    <div
      className="absolute z-15 rounded-full animate-pulse"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: '32px',
        height: '32px',
        background: `
          radial-gradient(60% 60% at 50% 35%, rgba(255, 255, 255, 0.9), transparent 65%),
          radial-gradient(100% 100% at 50% 70%, hsl(var(--flame-spark)), transparent 62%),
          radial-gradient(100% 100% at 50% 70%, hsl(var(--flame-ember)), transparent 62%)
        `,
        boxShadow: `
          0 0 20px hsl(var(--flame-spark) / 0.7),
          0 0 35px hsl(var(--flame-spark) / 0.4)
        `
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
        ⚡
      </div>
    </div>
  );
};