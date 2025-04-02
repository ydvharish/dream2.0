
import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash, Plus } from 'lucide-react';

interface TeamSetupProps {
  onStartGame: () => void;
}

const TeamSetup = ({ onStartGame }: TeamSetupProps) => {
  const { teams, addTeam, removeTeam, updateTeamName } = useGame();
  const [isValidForm, setIsValidForm] = useState(true);

  const validateForm = () => {
    // Check if all teams have names
    const allTeamsHaveNames = teams.every(team => team.name.trim().length > 0);
    setIsValidForm(allTeamsHaveNames);
    return allTeamsHaveNames;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onStartGame();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-blue-800 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-quiz-yellow mb-6">Enter Team Names</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="flex items-center space-x-3">
              <div className="team-circle">{team.id}</div>
              <Input
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                placeholder={`Team ${team.id} name`}
                className="quiz-input"
              />
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                onClick={() => removeTeam(team.id)}
                className="text-white hover:text-red-300"
              >
                <Trash size={18} />
              </Button>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            type="button"
            variant="outline" 
            onClick={addTeam}
            className="border-dashed border-2 border-blue-400 text-blue-200 hover:bg-blue-700 hover:text-white"
          >
            <Plus className="mr-2" size={18} />
            Add Team
          </Button>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            type="submit"
            className="bg-quiz-yellow hover:bg-amber-400 text-quiz-blue font-bold text-lg py-2 px-12 rounded-full"
          >
            Start Game
          </Button>
        </div>
        
        {!isValidForm && (
          <div className="text-red-400 text-center mt-4">
            All teams must have names before starting the game.
          </div>
        )}
      </form>
    </div>
  );
};

export default TeamSetup;
