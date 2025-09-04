import { memo } from 'react';

interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spam' | 'latency' | 'mev' | 'reorg' | 'fee';
}

const obstacleStyles = {
  spam: { bg: 'bg-purple-600', shadow: '0 0 12px hsl(280 70% 50% / 0.4)', text: 'SPAM', symbol: '⚠️' },
  latency: { bg: 'bg-blue-600', shadow: '0 0 12px hsl(240 70% 50% / 0.4)', text: 'FEES', symbol: '💸' },
  mev: { bg: 'bg-orange-600', shadow: '0 0 12px hsl(30 70% 50% / 0.4)', text: 'MEV', symbol: '🤖' },
  reorg: { bg: 'bg-gray-600', shadow: '0 0 12px hsl(0 0% 50% / 0.4)', text: 'REORG', symbol: '🔄' },
  fee: { bg: 'bg-red-600', shadow: '0 0 12px hsl(0 70% 50% / 0.4)', text: 'GAS', symbol: '⛽' }
};

export const Obstacle = memo(({ x, y, width, height, type }: ObstacleProps) => {
  const style = obstacleStyles[type];
  
  return (
    <div
      className={`absolute z-10 rounded-lg ${style.bg} border border-white/20 
                  flex flex-col items-center justify-center text-white font-bold text-xs 
                  will-change-transform`}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: style.shadow
      }}
    >
      <div className="text-lg mb-1">{style.symbol}</div>
      <div className="text-center leading-tight px-1">{style.text}</div>
    </div>
  );
});