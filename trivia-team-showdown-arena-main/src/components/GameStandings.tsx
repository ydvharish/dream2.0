
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';

const GameStandings = () => {
  const { standings, currentRound, continueRound, startNextRound, roundCompleted, teams } = useGame();
  
  // Sort teams by score for display
  const sortedTeams = [...standings].sort((a, b) => b.score - a.score);
  
  // Check if all teams have played in the current round
  const allTeamsPlayed = teams.every(team => team.hasPlayed || team.isEliminated);
  
  // Determine if we're at the end of a round where we need to eliminate teams
  const isEliminationRound = roundCompleted && allTeamsPlayed && currentRound < 3;
  
  // For elimination rounds, determine which teams advance
  const advancingTeamIds = isEliminationRound 
    ? currentRound === 1 
      ? sortedTeams.slice(0, 4).map(team => team.id)  // Top 4 advance from round 1 to 2
      : sortedTeams.slice(0, 2).map(team => team.id)  // Top 2 advance from round 2 to 3
    : [];
  
  // Filter teams based on current round
  const displayTeams = sortedTeams.filter(team => {
    if (currentRound === 1) return true; // Show all teams in round 1
    if (currentRound === 2) return !team.isEliminated; // Show only non-eliminated teams in round 2
    if (currentRound === 3) return !team.isEliminated; // Show only non-eliminated teams in round 3
    return true;
  });
  
  return (
    <div className="w-full max-w-3xl mx-auto fade-in">
      <div className="text-center mb-8 slide-in-top">
        <h2 className="text-3xl font-bold text-quiz-yellow">
          {allTeamsPlayed ? `Round ${currentRound} Results` : 'Current Standings'}
        </h2>
      </div>
      
      <div className="space-y-4">
        {displayTeams.map((team, index) => (
          <div 
            key={team.id}
            className={`flex items-center justify-between p-4 rounded-md ${
              isEliminationRound && allTeamsPlayed
                ? advancingTeamIds.includes(team.id)
                  ? 'bg-green-700'
                  : 'bg-red-700'
                : 'bg-blue-700'
            } transition-all hover-glow animate-fade-in`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-800 h-8 w-8 rounded-full flex items-center justify-center text-white font-bold">
                {team.id}
              </div>
              <div className="font-semibold text-white">{team.name}</div>
            </div>
            <div className="flex items-center">
              <div className="text-lg font-bold text-quiz-yellow">{team.score} pts</div>
              {isEliminationRound && allTeamsPlayed && (
                <div className="ml-4 text-sm text-white">
                  {advancingTeamIds.includes(team.id) ? 'Advancing' : 'Eliminated'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-center">
        {isEliminationRound ? (
          <Button 
            onClick={startNextRound}
            className="bg-quiz-yellow hover:bg-amber-500 text-quiz-blue font-bold py-3 px-8 text-lg btn-ripple zoom-in"
          >
            Start Round {currentRound + 1}
          </Button>
        ) : (
          <Button 
            onClick={continueRound}
            className="bg-quiz-yellow hover:bg-amber-500 text-quiz-blue font-bold py-3 px-8 text-lg btn-ripple zoom-in"
          >
            Continue Round {currentRound}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GameStandings;
