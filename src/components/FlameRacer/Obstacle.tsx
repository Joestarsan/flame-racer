interface ObstacleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spam' | 'latency' | 'mev' | 'reorg' | 'fee';
}

const obstacleStyles = {
  spam: {
    name: "SPAM FLOOD",
    bg: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
    border: "border-purple-400/30",
    shadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
    icon: "🌊"
  },
  latency: {
    name: "HIGH LATENCY",
    bg: "linear-gradient(135deg, #3B82F6, #1E40AF)",
    border: "border-blue-400/30", 
    shadow: "0 8px 25px rgba(59, 130, 246, 0.4)",
    icon: "⚡"
  },
  mev: {
    name: "MEV BOT",
    bg: "linear-gradient(135deg, #EF4444, #B91C1C)",
    border: "border-red-400/30",
    shadow: "0 8px 25px rgba(239, 68, 68, 0.4)",
    icon: "🤖"
  },
  reorg: {
    name: "CHAIN REORG",
    bg: "linear-gradient(135deg, #6B7280, #374151)",
    border: "border-gray-400/30",
    shadow: "0 8px 25px rgba(107, 114, 128, 0.4)",
    icon: "🔄"
  },
  fee: {
    name: "HIGH FEES",
    bg: "linear-gradient(135deg, #F59E0B, #D97706)",
    border: "border-amber-400/30",
    shadow: "0 8px 25px rgba(245, 158, 11, 0.4)",
    icon: "💰"
  }
};

export const Obstacle = ({ x, y, width, height, type }: ObstacleProps) => {
  const style = obstacleStyles[type];
  
  return (
    <div
      className={`absolute z-10 rounded-xl ${style.border} border-2 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-105`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        background: style.bg,
        boxShadow: style.shadow
      }}
    >
      <div className="text-2xl mb-1">{style.icon}</div>
      <div className="text-xs font-bold text-white opacity-90 px-2 leading-tight">
        {style.name}
      </div>
    </div>
  );
};