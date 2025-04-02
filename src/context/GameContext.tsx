import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Question, Answer, TeamPair, RoundInfo, ExtraQuestion } from '../types/game';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from 'sonner';

interface GameContextProps {
  teams: Team[];
  currentRound: number;
  rounds: RoundInfo[];
  selectedTeams: number[];
  currentPair: TeamPair | null;
  currentQuestion: Question | null;
  isQuestionMode: boolean;
  extraQuestions: ExtraQuestion[];
  standings: Team[];
  roundCompleted: boolean;
  
  addTeam: () => void;
  removeTeam: (id: number) => void;
  updateTeamName: (id: number, name: string) => void;
  
  toggleTeamSelection: (teamId: number) => void;
  startQuestionPair: () => void;
  
  revealQuestion: () => void;
  hideQuestion: () => void;
  revealAnswer: (answerId: number) => void;
  hideAnswer: (answerId: number) => void;
  updateQuestion: (text: string) => void;
  updateAnswer: (answerId: number, text: string, points: number) => void;
  strikeQuestion: () => void;
  unstrikeQuestion: () => void;
  
  addPoints: (teamId: number, points: number) => void;
  incrementTeamAnswers: (teamId: number) => void;
  
  addExtraQuestion: () => void;
  updateExtraQuestion: (id: number, text: string) => void;
  updateExtraAnswer: (questionId: number, answerId: number, text: string, points: number) => void;
  
  finishCurrentPair: () => void;
  changeRound: (roundNumber: number) => void;
  continueRound: () => void;
  startNextRound: () => void;
  
  handleAnswerDrop: (answerId: number, targetTeamId: number) => void;
}

const defaultRounds: RoundInfo[] = [
  { number: 1, questionsPerPair: 5, description: "Teams compete in pairs. Each pair will answer 5 questions." },
  { number: 2, questionsPerPair: 2, description: "Teams compete in pairs. Each pair will answer 2 questions." },
  { number: 3, questionsPerPair: 3, description: "Final round! Two teams compete for the championship." },
];

const createDefaultQuestion = (id: number): Question => {
  return {
    id,
    text: "Name a reason why someone might cancel plans with a friend",
    isRevealed: false,
    isStriked: false,
    answers: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      text: `Answer ${i + 1}`,
      points: 10 * (8 - i),
      isRevealed: false
    }))
  };
};

const createDefaultExtraQuestion = (id: number): ExtraQuestion => {
  return {
    id,
    text: `Extra Question ${id}`,
    isRevealed: false,
    answers: Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      text: `Answer ${i + 1}`,
      points: 10 * (8 - i),
      isRevealed: false
    }))
  };
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds] = useState<RoundInfo[]>(defaultRounds);
  const [selectedTeams, setSelectedTeams] = useState<number[]>([]);
  const [currentPair, setCurrentPair] = useState<TeamPair | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [extraQuestions, setExtraQuestions] = useState<ExtraQuestion[]>([createDefaultExtraQuestion(1)]);
  const [standings, setStandings] = useState<Team[]>([]);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (teams.length === 0) {
      const initialTeams: Team[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        score: 0,
        answers: 0,
        hasPlayed: false
      }));
      setTeams(initialTeams);
      setStandings(initialTeams);
    }
  }, [teams.length]);

  useEffect(() => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    setStandings(sortedTeams);
  }, [teams]);

  const addTeam = () => {
    if (teams.length >= 15) {
      toast({
        title: "Maximum teams reached",
        description: "You can have a maximum of 15 teams",
        variant: "destructive"
      });
      return;
    }
    const newId = teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1;
    const newTeam = { id: newId, name: `Team ${newId}`, score: 0, answers: 0, hasPlayed: false };
    setTeams([...teams, newTeam]);
  };

  const removeTeam = (id: number) => {
    if (teams.length <= 8) {
      toast({
        title: "Minimum teams required",
        description: "You need at least 8 teams",
        variant: "destructive"
      });
      return;
    }
    setTeams(teams.filter(team => team.id !== id));
  };

  const updateTeamName = (id: number, name: string) => {
    setTeams(teams.map(team => 
      team.id === id ? { ...team, name } : team
    ));
  };

  const toggleTeamSelection = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    if (team?.hasPlayed) {
      sonnerToast.error("This team has already played in this round");
      return;
    }

    if (selectedTeams.includes(teamId)) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      if (selectedTeams.length < 2) {
        setSelectedTeams([...selectedTeams, teamId]);
      } else {
        setSelectedTeams([selectedTeams[1], teamId]);
      }
    }
  };

  const startQuestionPair = () => {
    if (selectedTeams.length !== 2) {
      toast({
        title: "Select two teams",
        description: "You need to select exactly two teams to start",
        variant: "destructive"
      });
      return;
    }

    const team1 = teams.find(t => t.id === selectedTeams[0]);
    const team2 = teams.find(t => t.id === selectedTeams[1]);

    if (team1 && team2) {
      setCurrentPair({ team1, team2 });
      setCurrentQuestion(createDefaultQuestion(1));
      setIsQuestionMode(true);
      
      setTeams(teams.map(team => 
        team.id === team1.id || team.id === team2.id 
          ? { ...team, hasPlayed: true } 
          : team
      ));
    }
  };

  const revealQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isRevealed: true, isHidden: false });
    }
  };

  const hideQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isHidden: true });
    }
  };

  const strikeQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isStriked: true });
    }
  };

  const unstrikeQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isStriked: false });
    }
  };

  const revealAnswer = (answerId: number) => {
    if (currentQuestion) {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, isRevealed: true, isHidden: false } : answer
        )
      });
    }
  };

  const hideAnswer = (answerId: number) => {
    if (currentQuestion) {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, isHidden: true } : answer
        )
      });
    }
  };

  const updateQuestion = (text: string) => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, text });
    }
  };

  const updateAnswer = (answerId: number, text: string, points: number) => {
    if (currentQuestion) {
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, text, points } : answer
        )
      });
    }
  };

  const addPoints = (teamId: number, points: number) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, score: team.score + points } : team
    ));
    
    if (currentPair) {
      if (teamId === currentPair.team1.id) {
        setCurrentPair({
          ...currentPair,
          team1: {
            ...currentPair.team1,
            score: currentPair.team1.score + points
          }
        });
      } else if (teamId === currentPair.team2.id) {
        setCurrentPair({
          ...currentPair,
          team2: {
            ...currentPair.team2,
            score: currentPair.team2.score + points
          }
        });
      }
    }
  };

  const incrementTeamAnswers = (teamId: number) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, answers: team.answers + 1 } : team
    ));
  };

  const addExtraQuestion = () => {
    const newId = extraQuestions.length > 0 
      ? Math.max(...extraQuestions.map(q => q.id)) + 1 
      : 1;
    
    setExtraQuestions([...extraQuestions, createDefaultExtraQuestion(newId)]);
  };

  const updateExtraQuestion = (id: number, text: string) => {
    setExtraQuestions(extraQuestions.map(question => 
      question.id === id ? { ...question, text } : question
    ));
  };

  const updateExtraAnswer = (questionId: number, answerId: number, text: string, points: number) => {
    setExtraQuestions(extraQuestions.map(question => 
      question.id === questionId 
        ? {
            ...question,
            answers: question.answers.map(answer =>
              answer.id === answerId ? { ...answer, text, points } : answer
            )
          } 
        : question
    ));
  };

  const finishCurrentPair = () => {
    setCurrentPair(null);
    setCurrentQuestion(null);
    setIsQuestionMode(false);
    setSelectedTeams([]);
    
    // Always show standings after finishing a team pair
    setRoundCompleted(true);
  };

  const changeRound = (roundNumber: number) => {
    if (roundNumber >= 1 && roundNumber <= rounds.length) {
      setCurrentRound(roundNumber);
      finishCurrentPair();
      setRoundCompleted(false);
      
      setTeams(teams.map(team => ({ ...team, hasPlayed: false })));
    }
  };

  const continueRound = () => {
    setRoundCompleted(false);
    setSelectedTeams([]);
  };

  const startNextRound = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    let advancingTeams;
    
    if (currentRound === 1) {
      advancingTeams = sortedTeams.slice(0, 4).map(team => team.id);
    } else if (currentRound === 2) {
      advancingTeams = sortedTeams.slice(0, 2).map(team => team.id);
    } else {
      advancingTeams = [];
    }
    
    setTeams(teams.map(team => {
      const isAdvancing = advancingTeams.includes(team.id);
      return {
        ...team,
        isEliminated: !isAdvancing,
        hasPlayed: false,
        score: isAdvancing ? 0 : team.score,
        answers: isAdvancing ? 0 : team.answers
      };
    }));
    
    setCurrentRound(currentRound + 1);
    setRoundCompleted(false);
    setSelectedTeams([]);
  };

  const handleAnswerDrop = (answerId: number, targetTeamId: number) => {
    if (currentQuestion && currentPair) {
      const answer = currentQuestion.answers.find(a => a.id === answerId);
      
      if (answer && answer.isRevealed && !answer.isHidden) {
        addPoints(targetTeamId, answer.points);
        incrementTeamAnswers(targetTeamId);
        
        hideAnswer(answerId);
        
        sonnerToast.success(`${answer.points} points added to Team ${targetTeamId}`);
      }
    }
  };

  return (
    <GameContext.Provider value={{
      teams,
      currentRound,
      rounds,
      selectedTeams,
      currentPair,
      currentQuestion,
      isQuestionMode,
      extraQuestions,
      standings,
      roundCompleted,
      addTeam,
      removeTeam,
      updateTeamName,
      toggleTeamSelection,
      startQuestionPair,
      revealQuestion,
      hideQuestion,
      strikeQuestion,
      unstrikeQuestion,
      revealAnswer,
      hideAnswer,
      updateQuestion,
      updateAnswer,
      addPoints,
      incrementTeamAnswers,
      addExtraQuestion,
      updateExtraQuestion,
      updateExtraAnswer,
      finishCurrentPair,
      changeRound,
      continueRound,
      startNextRound,
      handleAnswerDrop
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
