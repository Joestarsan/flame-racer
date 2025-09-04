interface BonusProps {
  x: number;
  y: number;
}

export const Bonus = ({ x, y }: BonusProps) => {
  return (
    <div
      className="absolute z-15 w-[26px] h-[26px] rounded-full"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        background: `
          radial-gradient(60% 60% at 50% 35%, hsl(var(--foreground) / 0.7), transparent 65%),
          radial-gradient(100% 100% at 50% 70%, hsl(var(--success)), transparent 62%),
          radial-gradient(100% 100% at 50% 70%, hsl(var(--flame-ember)), transparent 62%)
        `,
        boxShadow: `
          0 0 16px hsl(var(--success) / 0.7),
          0 0 28px hsl(var(--success) / 0.5)
        `
      }}
    />
  );
};