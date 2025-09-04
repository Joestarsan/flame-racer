interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spam' | 'latency' | 'mev' | 'reorg' | 'fee';
}

const obstacleData = {
  spam: {
    gradient: 'from-purple-500 to-purple-800',
    glow: 'hsl(280 100% 70% / 0.4)',
    text: 'SPAM',
    symbol: '⚠️'
  },
  latency: {
    gradient: 'from-blue-500 to-blue-800', 
    glow: 'hsl(240 100% 70% / 0.4)',
    text: 'HIGH FEES',
    symbol: '💸'
  },
  mev: {
    gradient: 'from-orange-500 to-orange-800',
    glow: 'hsl(30 100% 60% / 0.4)',
    text: 'MEV BOT',
    symbol: '🤖'
  },
  reorg: {
    gradient: 'from-gray-500 to-gray-800',
    glow: 'hsl(0 0% 60% / 0.4)',
    text: 'REORG',
    symbol: '🔄'
  },
  fee: {
    gradient: 'from-red-500 to-red-800',
    glow: 'hsl(0 100% 60% / 0.4)',
    text: 'GAS FEE',
    symbol: '⛽'
  }
};

export const Obstacle = ({ x, y, width, height, type }: ObstacleProps) => {
  const obstacle = obstacleData[type];
  
  return (
    <div
      className={`absolute z-10 rounded-lg bg-gradient-to-b ${obstacle.gradient} border border-white/20 
                  flex flex-col items-center justify-center text-white font-bold text-xs overflow-hidden`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: `
          0 0 20px ${obstacle.glow},
          0 6px 18px rgba(0, 0, 0, 0.6),
          inset 0 0 0 1px rgba(255, 255, 255, 0.1)
        `
      }}
    >
      <div className="text-lg mb-1">{obstacle.symbol}</div>
      <div className="text-center leading-tight px-1">{obstacle.text}</div>
    </div>
  );
};