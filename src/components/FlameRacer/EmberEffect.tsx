import { useEffect, useState } from 'react';

interface Ember {
  id: string;
  left: number;
  animationDelay: number;
  duration: number;
  scale: number;
  xOffset: number;
  xEnd: number;
}

export const EmberEffect = () => {
  const [embers, setEmbers] = useState<Ember[]>([]);

  useEffect(() => {
    // Initial spawn
    const initialEmbers: Ember[] = [];
    for (let i = 0; i < 40; i++) {
      initialEmbers.push({
        id: `ember-${i}`,
        left: Math.random() * 100,
        animationDelay: Math.random() * 1000,
        duration: 2800 + Math.random() * 4200,
        scale: 0.7 + Math.random() * 1.1,
        xOffset: (Math.random() * 16) - 8,
        xEnd: (Math.random() * 60) - 30
      });
    }
    setEmbers(initialEmbers);

    // Continuous spawning
    const interval = setInterval(() => {
      const newEmbers: Ember[] = [];
      for (let i = 0; i < 3; i++) {
        newEmbers.push({
          id: `ember-${Date.now()}-${i}`,
          left: Math.random() * 100,
          animationDelay: 0,
          duration: 2800 + Math.random() * 4200,
          scale: 0.7 + Math.random() * 1.1,
          xOffset: (Math.random() * 16) - 8,
          xEnd: (Math.random() * 60) - 30
        });
      }
      
      setEmbers(prev => [...prev, ...newEmbers]);
      
      // Clean up old embers
      setTimeout(() => {
        setEmbers(prev => prev.filter(ember => 
          !newEmbers.some(newEmber => newEmber.id === ember.id)
        ));
      }, Math.max(...newEmbers.map(e => e.duration)) + 1000);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {embers.map(ember => (
        <div
          key={ember.id}
          className="absolute bottom-0 w-2 h-2 rounded-full ember-gradient opacity-0"
          style={{
            left: `${ember.left}%`,
            '--x': `${ember.xOffset}px`,
            '--xEnd': `${ember.xEnd}px`,
            '--s': ember.scale.toString(),
            animation: `ember-rise ${ember.duration}ms linear ${ember.animationDelay}ms forwards`,
            boxShadow: `
              0 0 18px hsl(var(--flame-core) / 0.45),
              0 0 36px hsl(var(--flame-hot) / 0.25)
            `
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};