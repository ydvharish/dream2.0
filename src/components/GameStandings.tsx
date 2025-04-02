
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GameStandings = () => {
  const { standings, currentRound, continueRound, startNextRound, roundCompleted, teams } = useGame();
  
  // Get teams that are relevant for the current round
  const displayTeams = standings.filter(team => {
    if (currentRound === 1) return true; // Show all teams in round 1
    if (currentRound === 2) return !team.isEliminated; // Only non-eliminated teams in round 2
    if (currentRound === 3) return !team.isEliminated; // Only non-eliminated teams in round 3
    return true;
  });
  
  // Check if all teams have played in the current round
  const allTeamsPlayed = teams.filter(team => !team.isEliminated).every(team => team.hasPlayed);
  
  // Determine if we're at the end of a round where we need to eliminate teams
  const isEliminationRound = roundCompleted && allTeamsPlayed && currentRound < 3;
  
  // For elimination rounds, determine which teams advance
  const advancingTeamIds = isEliminationRound 
    ? currentRound === 1 
      ? standings.slice(0, 4).map(team => team.id)  // Top 4 advance from round 1 to 2
      : standings.slice(0, 2).map(team => team.id)  // Top 2 advance from round 2 to 3
    : [];
  
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <div className="text-center mb-8 animate-slide-in-right">
        <h2 className="text-3xl font-bold text-quiz-yellow">
          {allTeamsPlayed ? `Round ${currentRound} Results` : 'Current Standings'}
        </h2>
        <p className="text-white mt-2">
          {currentRound < 3 ? `Showing scores for Round ${currentRound}` : 'Final Round Scores'}
        </p>
      </div>
      
      <div className="space-y-4">
        {displayTeams.map((team, index) => {
          // Get the round-specific score
          const roundScore = team.roundScores?.[currentRound] || 0;
          
          return (
            <div 
              key={team.id}
              className={`flex items-center justify-between p-4 rounded-md ${
                isEliminationRound && allTeamsPlayed
                  ? advancingTeamIds.includes(team.id)
                    ? 'bg-green-700'
                    : 'bg-red-700'
                  : 'bg-blue-700'
              } transition-all hover-scale animate-fade-in`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-800 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold">
                  {team.id}
                </div>
                <div className="font-semibold text-white">{team.name}</div>
              </div>
              <div className="flex items-center">
                <div className="text-lg font-bold text-quiz-yellow">
                  {roundScore} pts
                  <span className="text-sm text-white ml-2">
                    (Total: {team.score})
                  </span>
                </div>
                {isEliminationRound && allTeamsPlayed && (
                  <div className="ml-4 text-sm text-white animate-pulse">
                    {advancingTeamIds.includes(team.id) ? 'Advancing' : 'Eliminated'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex justify-center">
        {isEliminationRound ? (
          <Button 
            onClick={startNextRound}
            className="bg-quiz-yellow hover:bg-amber-500 text-quiz-blue font-bold py-3 px-8 text-lg hover-scale"
          >
            Start Round {currentRound + 1}
            <ChevronRight size={18} className="ml-1" />
          </Button>
        ) : (
          <Button 
            onClick={continueRound}
            className="bg-quiz-yellow hover:bg-amber-500 text-quiz-blue font-bold py-3 px-8 text-lg hover-scale"
          >
            Continue Round {currentRound}
            <ChevronRight size={18} className="ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameStandings;
