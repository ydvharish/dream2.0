
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import TeamGrid from "@/components/TeamGrid";
import QuestionPane from "@/components/QuestionPane";
import GameTimer from "@/components/GameTimer";
import GameRoundInfo from "@/components/GameRoundInfo";
import GameStandings from "@/components/GameStandings";
import ExtraQuestionsModal from "@/components/ExtraQuestionsModal";
import FinalResults from "@/components/FinalResults";
import ConfigureRoundQuestions from "@/components/ConfigureRoundQuestions";
import { ChevronLeft, ArrowLeft, ArrowRight, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const GamePage = () => {
  const { 
    currentRound, 
    rounds, 
    isQuestionMode, 
    changeRound, 
    roundCompleted,
    isGameFinished,
    showFinalResults,
    isConfigureQuestionsMode,
    enterConfigureQuestionsMode
  } = useGame();
  
  const navigate = useNavigate();
  const [showPageTransition, setShowPageTransition] = useState(false);
  
  const currentRoundInfo = rounds.find(r => r.number === currentRound);
  
  const handleNavigation = (path: string) => {
    setShowPageTransition(true);
    setTimeout(() => {
      navigate(path);
    }, 300);
  };
  
  return (
    <div className="min-h-screen bg-quiz-blue p-4">
      <div 
        className={`container mx-auto ${showPageTransition ? 'animate-fade-out' : 'animate-fade-in'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            className="text-white hover:text-quiz-yellow hover-scale"
            onClick={() => handleNavigation('/')}
          >
            <ChevronLeft size={20} />
            <span>Back to Home</span>
          </Button>
          
          <h1 className="text-4xl font-bold text-quiz-yellow animate-scale-in">
            Quiz Game Show
          </h1>
          
          <div>
            <ExtraQuestionsModal />
          </div>
        </div>
        
        {isConfigureQuestionsMode ? (
          <ConfigureRoundQuestions />
        ) : isGameFinished ? (
          <div>
            <FinalResults />
            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => handleNavigation('/')}
                className="bg-quiz-purple hover:bg-purple-700 hover-scale"
              >
                Return to Home
              </Button>
            </div>
          </div>
        ) : isQuestionMode ? (
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <GameTimer />
            </div>
            <QuestionPane />
            
            {/* Navigation buttons for Question Mode */}
            <div className="mt-8 w-full flex justify-between max-w-3xl mx-auto">
              <Button 
                onClick={() => navigate('/')}
                className="bg-blue-700 hover:bg-blue-600 hover-scale"
              >
                <ArrowLeft size={18} className="mr-1" />
                Return Home
              </Button>
            </div>
          </div>
        ) : roundCompleted ? (
          <div>
            <GameStandings />
            
            {/* Navigation buttons for Standings page */}
            <div className="mt-8 w-full flex justify-between max-w-3xl mx-auto">
              <Button 
                onClick={() => navigate('/')}
                className="bg-blue-700 hover:bg-blue-600 hover-scale"
              >
                <ArrowLeft size={18} className="mr-1" />
                Return Home
              </Button>
              
              {currentRound > 1 && (
                <Button
                  onClick={() => changeRound(currentRound - 1)}
                  className="bg-blue-700 hover:bg-blue-600 flex items-center hover-scale"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  Previous Round
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 text-center">
              <h2 className="text-4xl font-bold text-quiz-yellow mb-2 animate-scale-in">Round {currentRound}</h2>
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
                    ? "bg-quiz-yellow text-quiz-blue hover:bg-yellow-500 hover-scale" 
                    : "border-white text-white hover:bg-blue-800"
                  }
                >
                  Round {round.number}
                </Button>
              ))}
            </div>
            
            <div className="mb-8">
              <Button
                onClick={enterConfigureQuestionsMode}
                className="bg-quiz-purple hover:bg-purple-700 mx-auto block mb-6 hover-scale"
              >
                <Settings className="mr-2" /> Configure Round {currentRound} Questions
              </Button>
            </div>
            
            <TeamGrid />
            
            <div className="mt-8 flex justify-center space-x-6">
              {currentRound > 1 && (
                <Button
                  onClick={() => changeRound(currentRound - 1)}
                  className="bg-blue-700 hover:bg-blue-600 flex items-center hover-scale"
                >
                  <ArrowLeft size={18} className="mr-1" />
                  Previous Round
                </Button>
              )}
              {currentRound < rounds.length && (
                <Button
                  onClick={() => changeRound(currentRound + 1)}
                  className="bg-blue-700 hover:bg-blue-600 flex items-center hover-scale"
                >
                  Next Round
                  <ArrowRight size={18} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
