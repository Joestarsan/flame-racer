interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spam' | 'latency' | 'mev' | 'reorg' | 'fee';
}

const obstacleStyles = {
  spam: 'from-purple-600 to-purple-900',
  latency: 'from-blue-600 to-blue-900', 
  mev: 'from-orange-600 to-orange-900',
  reorg: 'from-gray-600 to-gray-900',
  fee: 'from-red-600 to-red-900'
};

export const Obstacle = ({ x, y, width, height, type }: ObstacleProps) => {
  return (
    <div
      className={`absolute z-10 rounded-lg bg-gradient-to-b ${obstacleStyles[type]} border border-white/10`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        boxShadow: `
          0 6px 18px rgba(0, 0, 0, 0.6),
          inset 0 0 0 1px rgba(0, 0, 0, 0.35)
        `
      }}
    />
  );
};