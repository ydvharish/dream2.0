
import { useGame } from "@/context/GameContext";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { showConfetti } from "@/lib/confetti";

const FinalResults = () => {
  const { standings, gameResult } = useGame();
  const navigate = useNavigate();
  
  // Get the top teams based on Round 3 scores only
  const sortedByRound3 = [...standings]
    .filter(team => team.roundScores && team.roundScores[3] !== undefined)
    .sort((a, b) => (b.roundScores?.[3] || 0) - (a.roundScores?.[3] || 0));
  
  const winner = sortedByRound3[0];
  const runnerUp = sortedByRound3[1];

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
  
  // Get round 3 scores specifically
  const winnerRound3Score = winner.roundScores?.[3] || 0;
  const runnerUpRound3Score = runnerUp.roundScores?.[3] || 0;
  
  return (
    <div className="w-full max-w-3xl mx-auto fade-in">
      <div className="text-center mb-8 slide-in-top">
        <h2 className="text-3xl font-bold text-quiz-yellow mb-6">
          Championship Results
        </h2>
        <p className="text-white text-lg mb-4">Based on Final Round Performance</p>
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
          <div className="flex flex-col items-end">
            <div className="text-4xl font-bold">{winnerRound3Score} pts</div>
            <div className="text-sm">(Total across all rounds: {winner.score} pts)</div>
          </div>
        </div>
        
        {/* Runner Up */}
        <div className="bg-red-600 text-white p-6 rounded-lg flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold">2nd</div>
            <div className="text-xl font-bold">{runnerUp.id}</div>
            <Medal size={28} className="text-white" />
            <div className="font-bold text-xl">Runner Up</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-4xl font-bold">{runnerUpRound3Score} pts</div>
            <div className="text-sm">(Total across all rounds: {runnerUp.score} pts)</div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-blue-800 p-4 rounded-lg text-center text-white">
        <p className="font-bold">Final Round Score: {winnerRound3Score} - {runnerUpRound3Score}</p>
        <p className="text-sm mt-2">Championship determined by final round performance only</p>
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
