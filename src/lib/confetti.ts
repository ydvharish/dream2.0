
// Simple confetti animation
export function showConfetti(x = 0.5, y = 0.5) {
  const count = 200;
  const defaults = {
    origin: { x, y },
    particleCount: count,
    spread: 70,
    startVelocity: 30,
    gravity: 1.2,
    ticks: 60,
    colors: ['#FFD700', '#FF4500', '#00BFFF', '#7CFC00', '#FF69B4']
  };

  // Create confetti elements
  for (let i = 0; i < count; i++) {
    const element = document.createElement('div');
    element.classList.add('confetti-particle');
    
    // Randomize properties
    const size = Math.random() * 10 + 5;
    const color = defaults.colors[Math.floor(Math.random() * defaults.colors.length)];
    const left = (defaults.origin.x * 100) + (Math.random() - 0.5) * defaults.spread;
    const top = (defaults.origin.y * 100) - 20;
    const angle = Math.random() * 360;
    
    // Set styles
    Object.assign(element.style, {
      position: 'fixed',
      zIndex: 9999,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: color,
      borderRadius: '50%',
      left: `calc(${left}% - ${size/2}px)`,
      top: `calc(${top}% - ${size/2}px)`,
      transform: `rotate(${angle}deg)`,
      pointerEvents: 'none'
    });
    
    document.body.appendChild(element);
    
    // Animate
    const duration = Math.random() * 2000 + 1000;
    const keyframes = [
      { 
        transform: `translate(0px, 0px) rotate(${angle}deg)`,
        opacity: 1
      },
      { 
        transform: `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 + 200}px) rotate(${angle + Math.random() * 720}deg)`,
        opacity: 0
      }
    ];
    
    element.animate(keyframes, {
      duration,
      easing: 'cubic-bezier(0, .9, .57, 1)',
      fill: 'forwards'
    }).onfinish = () => element.remove();
  }
}
