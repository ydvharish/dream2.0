import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GameRoundInfo from "@/components/GameRoundInfo";
import TeamSetup from "@/components/TeamSetup";
import QuestionSetup from "@/components/QuestionSetup";

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<'teams' | 'questions'>('teams');
  const navigate = useNavigate();
  
  const handleStartGame = () => {
    setIsDialogOpen(false);
    navigate('/game');
  };

  const handleTeamsNext = () => {
    setSetupStep('questions');
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-quiz-blue p-4">
      <div className="max-w-4xl w-full text-center mb-16">
        <h1 className="text-6xl font-bold text-quiz-yellow mb-4">
          Dream Team v2.0
        </h1>
        <p className="text-xl text-white">
          Test your knowledge and compete with your family and friends in this exciting game!
        </p>
      </div>
      
      <GameRoundInfo />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="bg-quiz-yellow hover:bg-yellow-500 text-quiz-blue font-bold px-12 py-6 text-2xl rounded-full"
          >
            Start Game
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-blue-800 border-blue-600">
          <DialogHeader>
            <DialogTitle className="text-2xl text-quiz-yellow text-center">
              {setupStep === 'teams' ? 'Team Setup' : 'Question Setup'}
            </DialogTitle>
          </DialogHeader>
          {setupStep === 'teams' ? (
            <TeamSetup onStartGame={handleTeamsNext} />
          ) : (
            <QuestionSetup onNext={handleStartGame} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
