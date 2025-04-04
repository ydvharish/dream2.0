import { useGame } from "@/context/GameContext";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { showConfetti } from "@/lib/confetti";

const FinalResults = () => {
  const { gameResult } = useGame();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Trigger confetti when component mounts
    showConfetti(0.5, 0.3);
    
    // Add more confetti after a small delay
    const timer = setTimeout(() => {
      showConfetti(0.3, 0.4);
      showConfetti(0.7, 0.4);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleEndGame = () => {
    navigate('/');
  };
  
  if (!gameResult) return null;
  
  return (
    <div className="w-full max-w-3xl mx-auto fade-in">
      <div className="text-center mb-8 slide-in-top">
        <h2 className="text-3xl font-bold text-quiz-yellow mb-6">
          Final Results
        </h2>
      </div>
      
      <div className="space-y-6">
        {/* Champion */}
        <div className="bg-quiz-yellow text-quiz-blue p-6 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">1st</div>
            <div className="text-xl font-bold">{gameResult.champion.name}</div>
            <Trophy size={28} className="text-quiz-blue" />
            <div className="font-bold text-xl">Champion!</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-4xl font-bold">{gameResult.champion.roundScores?.[3] || 0} pts</div>
            <div className="text-sm">(Final Round)</div>
          </div>
        </div>
        
        {/* Runner Up */}
        <div className="bg-red-600 text-white p-6 rounded-lg flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">2nd</div>
            <div className="text-xl font-bold">{gameResult.runnerUp.name}</div>
            <Medal size={28} className="text-white" />
            <div className="font-bold text-xl">Runner Up</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-4xl font-bold">{gameResult.runnerUp.roundScores?.[3] || 0} pts</div>
            <div className="text-sm">(Final Round)</div>
          </div>
        </div>

        {/* Second Runner Up */}
        <div className="bg-blue-600 text-white p-6 rounded-lg flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">3rd</div>
            <div className="text-xl font-bold">{gameResult.secondRunnerUp.name}</div>
            <Medal size={28} className="text-white opacity-75" />
            <div className="font-bold text-xl">Second Runner Up</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-4xl font-bold">{gameResult.secondRunnerUp.score} pts</div>
            <div className="text-sm">(Total Score)</div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <Button 
          onClick={handleEndGame}
          className="bg-quiz-yellow hover:bg-amber-500 text-quiz-blue font-bold py-3 px-8 text-lg animate-pulse"
        >
          End Game
        </Button>
      </div>
    </div>
  );
};

export default FinalResults;
