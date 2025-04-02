
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';

const TeamGrid = () => {
  const { teams, selectedTeams, toggleTeamSelection, startQuestionPair, currentRound } = useGame();
  
  // Filter teams to only show teams that haven't played yet and aren't eliminated
  const availableTeams = teams.filter(team => !team.hasPlayed && !team.isEliminated);
  
  return (
    <div className="w-full">
      <h2 className="text-2xl text-white text-center mb-4">
        Select 2 Teams for the Next Question Pair
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {availableTeams.map(team => (
          <div 
            key={team.id}
            onClick={() => toggleTeamSelection(team.id)}
            className={`cursor-pointer p-4 rounded-md text-center transition-all duration-300
              ${selectedTeams.includes(team.id) 
                ? 'bg-quiz-yellow text-quiz-blue'
                : 'bg-blue-800 text-white hover:bg-blue-700'}`}
          >
            <div className="text-2xl font-bold">{team.id}</div>
            <div className="text-lg mb-2 truncate">{team.name}</div>
            <div className="text-xl font-bold">
              {selectedTeams.includes(team.id) ? (
                <span className="text-quiz-blue">{team.score} pts</span>
              ) : (
                <span className="text-quiz-yellow">{team.score} pts</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedTeams.length === 2 && (
        <div className="flex justify-center">
          <Button 
            onClick={startQuestionPair} 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg"
          >
            Start Questions
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamGrid;
