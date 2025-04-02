
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TeamGrid from "@/components/TeamGrid";
import QuestionPane from "@/components/QuestionPane";
import GameTimer from "@/components/GameTimer";
import GameRoundInfo from "@/components/GameRoundInfo";
import GameStandings from "@/components/GameStandings";
import ExtraQuestionsModal from "@/components/ExtraQuestionsModal";
import { ChevronLeft } from "lucide-react";

const GamePage = () => {
  const { currentRound, rounds, isQuestionMode, changeRound, roundCompleted } = useGame();
  const navigate = useNavigate();
  
  const currentRoundInfo = rounds.find(r => r.number === currentRound);
  
  return (
    <div className="min-h-screen bg-quiz-blue p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="text-white hover:text-quiz-yellow"
            onClick={() => navigate('/')}
          >
            <ChevronLeft size={20} />
            <span>Back to Home</span>
          </Button>
          
          <h1 className="text-4xl font-bold text-quiz-yellow">
            Quiz Game Show
          </h1>
          
          <div>
            <ExtraQuestionsModal />
          </div>
        </div>
        
        {isQuestionMode ? (
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <GameTimer />
            </div>
            <QuestionPane />
          </div>
        ) : roundCompleted ? (
          <GameStandings />
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-quiz-yellow mb-2">Round {currentRound}</h2>
              <p className="text-white text-lg">
                {currentRoundInfo?.description}
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 mb-8">
              {rounds.map((round) => (
                <Button
                  key={round.number}
                  onClick={() => changeRound(round.number)}
                  variant={currentRound === round.number ? "default" : "outline"}
                  className={currentRound === round.number 
                    ? "bg-quiz-yellow text-quiz-blue hover:bg-yellow-500" 
                    : "border-white text-white hover:bg-blue-800"
                  }
                >
                  Round {round.number}
                </Button>
              ))}
            </div>
            
            <TeamGrid />
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
