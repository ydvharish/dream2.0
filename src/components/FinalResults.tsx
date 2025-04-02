
import { useGame } from "@/context/GameContext";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { showConfetti } from "@/lib/confetti";

const FinalResults = () => {
  const { standings } = useGame();
  const navigate = useNavigate();
  
  // Sort teams to get winner and runner-up
  const sortedTeams = [...standings].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const runnerUp = sortedTeams[1];

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
  
  if (!winner || !runnerUp) return null;
  
  return (
    <div className="w-full max-w-3xl mx-auto fade-in">
      <div className="text-center mb-8 slide-in-top">
        <h2 className="text-3xl font-bold text-quiz-yellow mb-6">
          Final Results
        </h2>
      </div>
      
      <div className="space-y-6">
        {/* Winner */}
        <div className="bg-quiz-yellow text-quiz-blue p-6 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">1st</div>
            <div className="text-xl font-bold">{winner.id}</div>
            <Trophy size={28} className="text-quiz-blue" />
            <div className="font-bold text-xl">Champion!</div>
          </div>
          <div className="text-4xl font-bold">{winner.score} pts</div>
        </div>
        
        {/* Runner Up */}
        <div className="bg-red-600 text-white p-6 rounded-lg flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">2nd</div>
            <div className="text-xl font-bold">{runnerUp.id}</div>
            <Medal size={28} className="text-white" />
            <div className="font-bold text-xl">Runner Up</div>
          </div>
          <div className="text-4xl font-bold">{runnerUp.score} pts</div>
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
