
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Timer, RefreshCw } from 'lucide-react';

const GameTimer = () => {
  const [time, setTime] = useState(100);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  
  const startTimer = () => {
    if (isRunning) return;
    setIsRunning(true);
    
    intervalRef.current = window.setInterval(() => {
      setTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsRunning(false);
    setTime(100);
  };
  
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2">
        <Timer className="text-quiz-yellow mr-2" size={24} />
        <span className="text-white text-2xl font-bold">{time}s</span>
      </div>
      <div className="flex space-x-2">
        <Button 
          onClick={startTimer} 
          disabled={isRunning || time === 0}
          className="bg-green-600 hover:bg-green-700 text-xs px-3 py-1"
        >
          Start Timer
        </Button>
        <Button 
          onClick={resetTimer} 
          className="bg-blue-800 hover:bg-blue-700 text-xs px-3 py-1"
        >
          <RefreshCw size={14} />
        </Button>
      </div>
    </div>
  );
};

export default GameTimer;
