
import { useGame } from "@/context/GameContext";

const GameRoundInfo = () => {
  const { rounds, currentRound } = useGame();
  
  const currentRoundInfo = rounds.find(r => r.number === currentRound);
  
  return (
    <div className="w-full max-w-3xl mx-auto mb-12 bg-quiz-blue rounded-lg p-6">
      {currentRoundInfo && (
        <div className="flex flex-col space-y-4 items-center">
          <div className="text-2xl font-bold text-quiz-yellow">Round {currentRound}</div>
          <p className="text-white text-center mb-4">{currentRoundInfo.description}</p>
          
          <div className="flex space-x-6">
            {rounds.map((round) => (
              <div key={round.number} className="flex flex-col items-center space-y-2 text-white">
                <div className={`rounded-full h-12 w-12 flex items-center justify-center text-xl font-bold
                  ${currentRound === round.number ? 'bg-quiz-yellow text-quiz-blue' : 'bg-blue-600'}`}>
                  {round.number}
                </div>
                <div className="text-sm">
                  {round.questionsPerPair} questions
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoundInfo;
