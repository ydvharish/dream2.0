import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Question, Answer, TeamPair, RoundInfo, ExtraQuestion, GameResult } from '../types/game';
import { useToast } from "@/components/ui/use-toast";
import { toast as sonnerToast } from 'sonner';
import { playPopSound, playCelebrationSound, playWrongSound } from '@/lib/sounds';
import { showConfetti } from '@/lib/confetti';

interface RoundQuestions {
  round1: Question[];
  round2: Question[];
  round3: Question[];
}

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
  currentQuestionNumber: number;
  totalQuestions: number;
  isGameFinished: boolean;
  showFinalResults: boolean;
  gameResult: GameResult | null;
  customQuestions: RoundQuestions;
  
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
  assignExtraQuestionPoints: (teamId: number, points: number) => void;
  
  finishCurrentPair: () => void;
  changeRound: (roundNumber: number) => void;
  continueRound: () => void;
  startNextRound: () => void;
  nextQuestion: () => void;
  
  handleAnswerDrop: (answerId: number, targetTeamId: number) => void;
  updateCustomQuestions: (questions: RoundQuestions) => void;
}

const defaultRounds: RoundInfo[] = [
  { number: 1, questionsPerPair: 2, description: "Round 1: Teams compete in pairs. Each pair will answer 2 questions." },
  { number: 2, questionsPerPair: 2, description: "Round 2: Teams compete in pairs. Each pair will answer 2 questions." },
  { number: 3, questionsPerPair: 3, description: "Final round! Two teams compete for the championship with 3 questions." },
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

function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(1);
  const [isGameFinished, setIsGameFinished] = useState(false);
  const [showFinalResults, setShowFinalResults] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [customQuestions, setCustomQuestions] = useState<RoundQuestions>({
    round1: [],
    round2: [],
    round3: []
  });
  const { toast } = useToast();

  useEffect(() => {
    if (teams.length === 0) {
      const initialTeams: Team[] = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Team ${i + 1}`,
        score: 0,
        answers: 0,
        hasPlayed: false,
        roundScores: {1: 0, 2: 0, 3: 0}
      }));
      setTeams(initialTeams);
      setStandings(initialTeams);
    }
  }, [teams.length]);

  useEffect(() => {
    if (isGameFinished) {
      // Sort teams based on round 3 scores for champion and runner up
      const round3Teams = teams.filter(team => team.roundScores?.[3] !== undefined)
        .sort((a, b) => (b.roundScores?.[3] || 0) - (a.roundScores?.[3] || 0));

      // Sort remaining teams based on total score for second runner up
      const remainingTeams = teams.filter(team => !round3Teams.slice(0, 2).some(t => t.id === team.id))
        .sort((a, b) => b.score - a.score);

      if (round3Teams.length >= 2 && remainingTeams.length >= 1) {
        const champion = round3Teams[0];
        const runnerUp = round3Teams[1];
        const secondRunnerUp = remainingTeams[0];
        
        setGameResult({
          champion,
          runnerUp,
          secondRunnerUp,
          finalRoundScore: `${champion.roundScores?.[3] || 0} - ${runnerUp.roundScores?.[3] || 0}`
        });

        // Update standings to show final positions
        setStandings([champion, runnerUp, secondRunnerUp, ...remainingTeams.slice(1)]);
      }
    } 
    else {
      const sortedTeams = [...teams].sort((a, b) => {
        const aRoundScore = a.roundScores?.[currentRound] || 0;
        const bRoundScore = b.roundScores?.[currentRound] || 0;
        return bRoundScore - aRoundScore;
      });
      setStandings(sortedTeams);
    }
  }, [teams, isGameFinished, currentRound]);
  
  useEffect(() => {
    if (currentRound && rounds) {
      const roundInfo = rounds.find(r => r.number === currentRound);
      if (roundInfo) {
        setTotalQuestions(roundInfo.questionsPerPair);
      }
    }
  }, [currentRound, rounds]);

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
    const newTeam = { 
      id: newId, 
      name: `Team ${newId}`, 
      score: 0, 
      answers: 0, 
      hasPlayed: false,
      roundScores: {1: 0, 2: 0, 3: 0}
    };
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
      setCurrentPair({ 
        team1: {...team1, score: 0},
        team2: {...team2, score: 0}
      });
      
      // Get questions for current round
      const roundQuestions = customQuestions[`round${currentRound}` as keyof RoundQuestions];
      const teamsPlayedCount = teams.filter(t => t.hasPlayed).length;
      const currentPairIndex = Math.floor(teamsPlayedCount / 2);
      const roundInfo = rounds.find(r => r.number === currentRound);
      const questionsPerPair = roundInfo?.questionsPerPair || 1;
      const questionIndex = currentPairIndex * questionsPerPair;
      
      if (roundQuestions && roundQuestions.length > questionIndex) {
        const baseQuestion = roundQuestions[questionIndex];
        setCurrentQuestion({
          ...baseQuestion,
          isRevealed: false,
          isStriked: false,
          answers: baseQuestion.answers.map(a => ({
            ...a,
            isRevealed: false,
            isHidden: false
          }))
        });
      } else {
        setCurrentQuestion(createDefaultQuestion(currentQuestionNumber));
      }
      
      setIsQuestionMode(true);
      setCurrentQuestionNumber(1);
      
      setTeams(teams.map(team => 
        team.id === team1.id || team.id === team2.id 
          ? { ...team, hasPlayed: true } 
          : team
      ));
    }
  };

  const nextQuestion = () => {
    const nextNum = currentQuestionNumber + 1;
    
    if (nextNum <= totalQuestions) {
      setCurrentQuestionNumber(nextNum);
      
      // Get questions for current round
      const roundQuestions = customQuestions[`round${currentRound}` as keyof RoundQuestions];
      const teamsPlayedCount = teams.filter(t => t.hasPlayed).length;
      const currentPairIndex = Math.floor((teamsPlayedCount - 2) / 2); // Subtract 2 because the current pair is already marked as played
      const roundInfo = rounds.find(r => r.number === currentRound);
      const questionsPerPair = roundInfo?.questionsPerPair || 1;
      const questionIndex = (currentPairIndex * questionsPerPair) + (nextNum - 1);
      
      if (roundQuestions && roundQuestions.length > questionIndex) {
        const baseQuestion = roundQuestions[questionIndex];
        setCurrentQuestion({
          ...baseQuestion,
          isRevealed: false,
          isStriked: false,
          answers: baseQuestion.answers.map(a => ({
            ...a,
            isRevealed: false,
            isHidden: false
          }))
        });
      } else {
        setCurrentQuestion(createDefaultQuestion(nextNum));
      }
    } else {
      finishCurrentPair();
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
      playWrongSound();
      // Auto-close strike after 1 second
      setTimeout(() => {
        setCurrentQuestion(prev => prev ? { ...prev, isStriked: false } : null);
      }, 1000);
    }
  };

  const unstrikeQuestion = () => {
    if (currentQuestion) {
      setCurrentQuestion({ ...currentQuestion, isStriked: false });
    }
  };

  const revealAnswer = (answerId: number) => {
    if (currentQuestion) {
      playPopSound();
      setCurrentQuestion({
        ...currentQuestion,
        answers: currentQuestion.answers.map(answer => 
          answer.id === answerId ? { ...answer, isRevealed: true, isHidden: false } : answer
        )
      });
      
      setTimeout(() => {
        showConfetti(Math.random() * 0.5 + 0.25, Math.random() * 0.3 + 0.3);
      }, 300);
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
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        const updatedRoundScores = {...(team.roundScores || {1: 0, 2: 0, 3: 0})};
        updatedRoundScores[currentRound] = (updatedRoundScores[currentRound] || 0) + points;
        
        return { 
          ...team, 
          score: team.score + points,
          roundScores: updatedRoundScores
        };
      }
      return team;
    }));
    
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
    
    if (points > 0) {
      playCelebrationSound();
      showConfetti(Math.random() * 0.5 + 0.25, Math.random() * 0.3 + 0.3);
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
  
  const assignExtraQuestionPoints = (teamId: number, points: number) => {
    addPoints(teamId, points);
    sonnerToast.success(`${points} points added to Team ${teamId} from extra question`);
  };

  const finishCurrentPair = () => {
    if (currentPair) {
      // Update the teams array with the final scores from the current pair
      setTeams(teams.map(team => {
        if (team.id === currentPair.team1.id) {
          return {
            ...team,
            score: team.score + (currentPair.team1.score - (team.roundScores?.[currentRound] || 0)),
            roundScores: {
              ...(team.roundScores || {1: 0, 2: 0, 3: 0}),
              [currentRound]: (team.roundScores?.[currentRound] || 0) + currentPair.team1.score
            }
          };
        }
        if (team.id === currentPair.team2.id) {
          return {
            ...team,
            score: team.score + (currentPair.team2.score - (team.roundScores?.[currentRound] || 0)),
            roundScores: {
              ...(team.roundScores || {1: 0, 2: 0, 3: 0}),
              [currentRound]: (team.roundScores?.[currentRound] || 0) + currentPair.team2.score
            }
          };
        }
        return team;
      }));
    }

    setCurrentPair(null);
    setCurrentQuestion(null);
    setIsQuestionMode(false);
    setSelectedTeams([]);
    setCurrentQuestionNumber(1);
    
    setRoundCompleted(true);
    
    const teamsInRound = teams.filter(team => !team.isEliminated);
    const allTeamsPlayedInRound = teamsInRound.every(team => team.hasPlayed);
    
    if (currentRound === 3 && allTeamsPlayedInRound) {
      setIsGameFinished(true);
      setShowFinalResults(true);
    }
  };

  const changeRound = (roundNumber: number) => {
    if (roundNumber >= 1 && roundNumber <= rounds.length) {
      setCurrentRound(roundNumber);
      setCurrentPair(null);
      setCurrentQuestion(null);
      setIsQuestionMode(false);
      setRoundCompleted(false);
      setSelectedTeams([]);
      setCurrentQuestionNumber(1);
      setIsGameFinished(false);
      setShowFinalResults(false);
      
      setTeams(teams.map(team => ({ ...team, hasPlayed: false })));
    }
  };

  const continueRound = () => {
    setRoundCompleted(false);
    setSelectedTeams([]);
  };

  const startNextRound = () => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    let advancingTeams: number[];
    
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
        roundScores: {
          ...(team.roundScores || {1: 0, 2: 0, 3: 0}),
          [currentRound + 1]: 0
        }
      };
    }));
    
    setCurrentRound(currentRound + 1);
    setRoundCompleted(false);
    setSelectedTeams([]);
    setCurrentQuestionNumber(1);
    
    if (currentRound === 3) {
      setIsGameFinished(true);
      setShowFinalResults(true);
    }
  };

  const handleAnswerDrop = (answerId: number, targetTeamId: number) => {
    if (currentQuestion) {
      const answer = currentQuestion.answers.find(a => a.id === answerId);
      if (answer && answer.isRevealed && !answer.isHidden) {
        // Update the team's total score and round score
        setTeams(teams.map(team => {
          if (team.id === targetTeamId) {
            return {
              ...team,
              score: team.score + answer.points,
              roundScores: {
                ...team.roundScores,
                [currentRound]: (team.roundScores?.[currentRound] || 0) + answer.points
              }
            };
          }
          return team;
        }));

        // Update the current pair's scores for UI display
        if (currentPair) {
          if (targetTeamId === currentPair.team1.id) {
            setCurrentPair({
              ...currentPair,
              team1: {
                ...currentPair.team1,
                score: currentPair.team1.score + answer.points
              }
            });
          } else if (targetTeamId === currentPair.team2.id) {
            setCurrentPair({
              ...currentPair,
              team2: {
                ...currentPair.team2,
                score: currentPair.team2.score + answer.points
              }
            });
          }
        }
        
        incrementTeamAnswers(targetTeamId);
        hideAnswer(answerId);
        
        sonnerToast.success(`${answer.points} points added to Team ${targetTeamId}`);
        playCelebrationSound();
        showConfetti(Math.random() * 0.5 + 0.25, Math.random() * 0.3 + 0.3);
      }
    }
  };

  const updateCustomQuestions = (questions: RoundQuestions) => {
    setCustomQuestions(questions);
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
      currentQuestionNumber,
      totalQuestions,
      isGameFinished,
      showFinalResults,
      gameResult,
      customQuestions,
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
      assignExtraQuestionPoints,
      finishCurrentPair,
      changeRound,
      continueRound,
      startNextRound,
      nextQuestion,
      handleAnswerDrop,
      updateCustomQuestions
    }}>
      {children}
    </GameContext.Provider>
  );
};

export { GameProvider, useGame };
