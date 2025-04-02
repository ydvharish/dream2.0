
import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Plus, Check, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RoundQuestion } from '@/types/game';

const ConfigureRoundQuestions = () => {
  const { 
    rounds, 
    currentRound, 
    roundQuestions, 
    exitConfigureQuestionsMode,
    updateRoundQuestion,
    teams,
    extraQuestions,
    updateExtraQuestion,
    updateExtraAnswer,
    addExtraQuestion
  } = useGame();

  const [activeTab, setActiveTab] = useState(currentRound.toString());
  
  // Create a state to track edited questions
  const [editedQuestions, setEditedQuestions] = useState<{
    [roundNumber: string]: RoundQuestion[]
  }>({});

  // Create a state for editing extra questions
  const [editedExtraQuestions, setEditedExtraQuestions] = useState(extraQuestions);

  // Calculate how many questions are needed per round based on team count
  const getRequiredQuestionsPerRound = (roundNum: number) => {
    const totalTeams = teams.filter(t => !t.isEliminated).length;
    
    if (roundNum === 1) {
      // Round 1: Each pair needs a unique question (totalTeams / 2 pairs)
      return Math.ceil(totalTeams / 2);
    } else if (roundNum === 2) {
      // Round 2: Each pair needs 2 questions but only 4 total questions in the pool
      return 4;
    } else {
      // Round 3: Final pair needs 3 questions
      return 3;
    }
  };

  // Initialize edited questions with current round questions
  useEffect(() => {
    const initialState: {[key: string]: RoundQuestion[]} = {};
    
    rounds.forEach(round => {
      const roundNum = round.number.toString();
      initialState[roundNum] = [...(roundQuestions[round.number] || [])];
      
      // Make sure we have the right number of questions for this round
      const questionsNeeded = getRequiredQuestionsPerRound(round.number);
      
      while (initialState[roundNum].length < questionsNeeded) {
        initialState[roundNum].push({
          questionNumber: initialState[roundNum].length + 1,
          text: "",
          answers: Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            text: `Answer ${i + 1}`,
            points: 10 * (8 - i)
          }))
        });
      }
    });
    
    setEditedQuestions(initialState);
    setEditedExtraQuestions([...extraQuestions]);
  }, [roundQuestions, rounds, teams, extraQuestions]);

  const updateQuestionText = (roundNum: string, questionIndex: number, text: string) => {
    setEditedQuestions(prev => {
      const updated = { ...prev };
      if (!updated[roundNum]) {
        updated[roundNum] = [];
      }
      
      // Ensure the array has the needed length
      while (updated[roundNum].length <= questionIndex) {
        updated[roundNum].push({
          questionNumber: updated[roundNum].length + 1,
          text: "",
          answers: Array.from({ length: 8 }, (_, i) => ({
            id: i + 1,
            text: `Answer ${i + 1}`,
            points: 10 * (8 - i)
          }))
        });
      }
      
      updated[roundNum][questionIndex] = {
        ...updated[roundNum][questionIndex],
        text
      };
      
      return updated;
    });
  };

  const updateAnswerText = (roundNum: string, questionIndex: number, answerIndex: number, text: string) => {
    setEditedQuestions(prev => {
      const updated = { ...prev };
      if (!updated[roundNum][questionIndex].answers) {
        updated[roundNum][questionIndex].answers = [];
      }
      
      updated[roundNum][questionIndex].answers[answerIndex] = {
        ...updated[roundNum][questionIndex].answers[answerIndex],
        text
      };
      
      return updated;
    });
  };

  const updateAnswerPoints = (roundNum: string, questionIndex: number, answerIndex: number, points: number) => {
    setEditedQuestions(prev => {
      const updated = { ...prev };
      
      updated[roundNum][questionIndex].answers[answerIndex] = {
        ...updated[roundNum][questionIndex].answers[answerIndex],
        points
      };
      
      return updated;
    });
  };

  const addQuestion = (roundNum: string) => {
    setEditedQuestions(prev => {
      const updated = { ...prev };
      if (!updated[roundNum]) {
        updated[roundNum] = [];
      }
      
      const newQuestionNumber = updated[roundNum].length + 1;
      
      updated[roundNum].push({
        questionNumber: newQuestionNumber,
        text: "",
        answers: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          text: `Answer ${i + 1}`,
          points: 10 * (8 - i)
        }))
      });
      
      return updated;
    });
    
    toast.success(`Question added to Round ${roundNum}`);
  };

  // Extra question functions
  const updateExtraQuestionText = (index: number, text: string) => {
    setEditedExtraQuestions(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        text
      };
      return updated;
    });
  };

  const updateExtraAnswerText = (questionIndex: number, answerIndex: number, text: string) => {
    setEditedExtraQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex].answers[answerIndex] = {
        ...updated[questionIndex].answers[answerIndex],
        text
      };
      return updated;
    });
  };

  const updateExtraAnswerPoints = (questionIndex: number, answerIndex: number, points: number) => {
    setEditedExtraQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex].answers[answerIndex] = {
        ...updated[questionIndex].answers[answerIndex],
        points
      };
      return updated;
    });
  };

  const handleAddExtraQuestion = () => {
    const newExtraQuestion = {
      id: editedExtraQuestions.length > 0 ? Math.max(...editedExtraQuestions.map(q => q.id)) + 1 : 1,
      text: "New Extra Question",
      isRevealed: false,
      answers: Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        text: `Answer ${i + 1}`,
        points: 10 * (8 - i),
        isRevealed: false
      }))
    };
    
    setEditedExtraQuestions(prev => [...prev, newExtraQuestion]);
    toast.success("Extra question added");
  };

  const saveAllQuestions = () => {
    // Save all round question data to context
    Object.entries(editedQuestions).forEach(([roundNumStr, questions]) => {
      const roundNum = parseInt(roundNumStr);
      
      questions.forEach((question, index) => {
        updateRoundQuestion(roundNum, index, question);
      });
    });
    
    // Save extra questions
    editedExtraQuestions.forEach((question, index) => {
      updateExtraQuestion(question.id, question.text);
      
      question.answers.forEach(answer => {
        updateExtraAnswer(question.id, answer.id, answer.text, answer.points);
      });
    });
    
    toast.success("All questions saved successfully!");
  };

  const getQuestionsForRound = (roundNum: string) => {
    const roundNumber = parseInt(roundNum);
    const questionsNeeded = getRequiredQuestionsPerRound(roundNumber);
    
    if (editedQuestions[roundNum] && editedQuestions[roundNum].length >= questionsNeeded) {
      return editedQuestions[roundNum].slice(0, questionsNeeded);
    }
    
    // Return default questions if not enough are configured
    return Array.from({ length: questionsNeeded }, (_, i) => ({
      questionNumber: i + 1,
      text: `Question ${i + 1}`,
      answers: Array.from({ length: 8 }, (_, j) => ({
        id: j + 1,
        text: `Answer ${j + 1}`,
        points: 10 * (8 - j)
      }))
    }));
  };

  const handleStartRound = () => {
    saveAllQuestions();
    exitConfigureQuestionsMode();
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-quiz-yellow">Configure Round Questions</h2>
        <p className="text-white">Set up all the questions and answers for each round</p>
      </div>
      
      <Tabs 
        defaultValue={currentRound.toString()} 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-8">
          {rounds.map(round => (
            <TabsTrigger 
              key={round.number} 
              value={round.number.toString()}
              className="text-lg"
            >
              Round {round.number}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {rounds.map(round => {
          const roundNum = round.number.toString();
          const questions = getQuestionsForRound(roundNum);
          const requiredQuestions = getRequiredQuestionsPerRound(round.number);
          
          return (
            <TabsContent key={round.number} value={roundNum} className="mt-4">
              <Card className="bg-blue-900 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-quiz-yellow">Round {round.number} Questions</CardTitle>
                  <CardDescription className="text-white">
                    {round.description}
                    <div className="mt-2">
                      Required questions for this round: <span className="font-bold">{requiredQuestions}</span>
                      {round.number === 1 && ` (based on ${teams.length} teams, ${Math.ceil(teams.length / 2)} pairs)`}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {questions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-blue-800 p-4 rounded-md">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-quiz-yellow mb-2">
                          Question {qIndex + 1}
                        </h3>
                        <Textarea
                          value={question.text}
                          onChange={(e) => updateQuestionText(roundNum, qIndex, e.target.value)}
                          placeholder="Enter question text here..."
                          className="w-full bg-blue-700 text-white border-blue-600"
                        />
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Answers</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {question.answers.map((answer, aIndex) => (
                            <div key={aIndex} className="flex gap-2 items-center">
                              <div className="bg-blue-700 text-white w-6 h-6 flex items-center justify-center rounded">
                                {aIndex + 1}
                              </div>
                              <Input
                                value={answer.text}
                                onChange={(e) => updateAnswerText(roundNum, qIndex, aIndex, e.target.value)}
                                placeholder={`Answer ${aIndex + 1}`}
                                className="flex-1 bg-blue-700 text-white border-blue-600"
                              />
                              <Input
                                type="number"
                                value={answer.points}
                                onChange={(e) => updateAnswerPoints(roundNum, qIndex, aIndex, parseInt(e.target.value) || 0)}
                                className="w-20 bg-blue-700 text-white border-blue-600"
                                min="0"
                              />
                              <span className="text-white text-sm">pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-center">
                    <Button
                      onClick={() => addQuestion(roundNum)}
                      className="bg-quiz-purple hover:bg-purple-700"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>
      
      <div className="mt-8">
        <Card className="bg-blue-900 border-blue-700">
          <CardHeader>
            <CardTitle className="text-quiz-yellow">Extra Questions</CardTitle>
            <CardDescription className="text-white">
              Configure additional questions that can be used during the game
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {editedExtraQuestions.map((question, qIndex) => (
              <div key={qIndex} className="bg-blue-800 p-4 rounded-md">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-quiz-yellow mb-2">
                    Extra Question {qIndex + 1}
                  </h3>
                  <Textarea
                    value={question.text}
                    onChange={(e) => updateExtraQuestionText(qIndex, e.target.value)}
                    placeholder="Enter extra question text here..."
                    className="w-full bg-blue-700 text-white border-blue-600"
                  />
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">Answers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.answers.map((answer, aIndex) => (
                      <div key={aIndex} className="flex gap-2 items-center">
                        <div className="bg-blue-700 text-white w-6 h-6 flex items-center justify-center rounded">
                          {aIndex + 1}
                        </div>
                        <Input
                          value={answer.text}
                          onChange={(e) => updateExtraAnswerText(qIndex, aIndex, e.target.value)}
                          placeholder={`Answer ${aIndex + 1}`}
                          className="flex-1 bg-blue-700 text-white border-blue-600"
                        />
                        <Input
                          type="number"
                          value={answer.points}
                          onChange={(e) => updateExtraAnswerPoints(qIndex, aIndex, parseInt(e.target.value) || 0)}
                          className="w-20 bg-blue-700 text-white border-blue-600"
                          min="0"
                        />
                        <span className="text-white text-sm">pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center">
              <Button
                onClick={handleAddExtraQuestion}
                className="bg-quiz-purple hover:bg-purple-700"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Extra Question
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button 
          onClick={exitConfigureQuestionsMode} 
          variant="outline"
          className="text-white border-white hover:bg-blue-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        
        <div className="space-x-4">
          <Button 
            onClick={saveAllQuestions}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="mr-2 h-4 w-4" /> Save Questions
          </Button>
          
          <Button 
            onClick={handleStartRound}
            className="bg-quiz-yellow hover:bg-amber-500 text-quiz-blue"
          >
            <Check className="mr-2 h-4 w-4" /> Save & Start Round
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfigureRoundQuestions;
