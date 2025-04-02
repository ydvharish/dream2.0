
import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Save, Plus, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExtraQuestionsModal = () => {
  const { extraQuestions, addExtraQuestion, updateExtraQuestion, updateExtraAnswer } = useGame();
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [editingAnswer, setEditingAnswer] = useState<{ questionId: number, answerId: number } | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answerPoints, setAnswerPoints] = useState(0);
  const [revealedQuestions, setRevealedQuestions] = useState<number[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<{questionId: number, answerId: number}[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const navigate = useNavigate();

  const startEditingQuestion = (id: number, text: string) => {
    setEditingQuestion(id);
    setQuestionText(text);
  };

  const handleSaveQuestion = () => {
    if (editingQuestion !== null) {
      updateExtraQuestion(editingQuestion, questionText);
      setEditingQuestion(null);
    }
  };

  const startEditingAnswer = (questionId: number, answerId: number, text: string, points: number) => {
    setEditingAnswer({ questionId, answerId });
    setAnswerText(text);
    setAnswerPoints(points);
  };

  const handleSaveAnswer = () => {
    if (editingAnswer !== null) {
      updateExtraAnswer(editingAnswer.questionId, editingAnswer.answerId, answerText, answerPoints);
      setEditingAnswer(null);
    }
  };

  const toggleRevealQuestion = (questionId: number) => {
    if (revealedQuestions.includes(questionId)) {
      setRevealedQuestions(revealedQuestions.filter(id => id !== questionId));
    } else {
      setRevealedQuestions([...revealedQuestions, questionId]);
    }
  };

  const toggleRevealAnswer = (questionId: number, answerId: number) => {
    const isRevealed = revealedAnswers.some(item => 
      item.questionId === questionId && item.answerId === answerId
    );
    
    if (isRevealed) {
      setRevealedAnswers(revealedAnswers.filter(item => 
        !(item.questionId === questionId && item.answerId === answerId)
      ));
    } else {
      setRevealedAnswers([...revealedAnswers, { questionId, answerId }]);
    }
  };

  // Full screen version showing in a separate page-like view
  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-quiz-blue p-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="ghost"
              className="text-white hover:text-quiz-yellow"
              onClick={() => setIsFullScreen(false)}
            >
              Back to Game
            </Button>
            
            <h1 className="text-4xl font-bold text-quiz-yellow">
              Extra Questions
            </h1>
            
            <div></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {extraQuestions.map((question) => (
              <div key={question.id} className="bg-blue-700 p-6 rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Question {question.id}</h2>
                  <Button
                    variant="ghost"
                    onClick={() => toggleRevealQuestion(question.id)}
                    className="text-quiz-yellow hover:bg-blue-600"
                  >
                    {revealedQuestions.includes(question.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                
                {editingQuestion === question.id ? (
                  <div className="flex mb-4">
                    <Textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="flex-1 mr-2 bg-blue-800 text-white border-blue-600"
                    />
                    <Button onClick={handleSaveQuestion} className="bg-green-600 hover:bg-green-700">
                      <Save size={18} />
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mb-4 bg-blue-800 p-4 rounded">
                    <p className="text-white">{question.text}</p>
                    <Button
                      onClick={() => startEditingQuestion(question.id, question.text)}
                      variant="ghost"
                      className="text-white hover:text-quiz-yellow"
                    >
                      <Edit2 size={16} />
                    </Button>
                  </div>
                )}
                
                {revealedQuestions.includes(question.id) && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-lg font-semibold text-quiz-yellow">Answers:</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {question.answers.map((answer) => {
                        const isAnswerRevealed = revealedAnswers.some(item => 
                          item.questionId === question.id && item.answerId === answer.id
                        );
                        
                        return isAnswerRevealed ? (
                          <div key={answer.id} className="bg-blue-600 p-3 rounded flex justify-between items-center">
                            {editingAnswer?.questionId === question.id && editingAnswer?.answerId === answer.id ? (
                              <div className="flex w-full items-center">
                                <Input
                                  value={answerText}
                                  onChange={(e) => setAnswerText(e.target.value)}
                                  className="flex-1 mr-2 bg-blue-700 text-white border-blue-600"
                                />
                                <Input
                                  type="number"
                                  value={answerPoints}
                                  onChange={(e) => setAnswerPoints(parseInt(e.target.value) || 0)}
                                  className="w-16 mr-2 bg-blue-700 text-white border-blue-600"
                                />
                                <Button onClick={handleSaveAnswer} className="bg-green-600 hover:bg-green-700">
                                  <Save size={16} />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-white">{answer.text}</span>
                                <div className="flex items-center">
                                  <span className="bg-quiz-yellow text-quiz-blue px-2 py-1 rounded font-bold text-sm mr-2">
                                    {answer.points} pts
                                  </span>
                                  <Button
                                    onClick={() => startEditingAnswer(question.id, answer.id, answer.text, answer.points)}
                                    variant="ghost"
                                    className="text-white hover:text-quiz-yellow p-1 h-auto"
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button
                                    onClick={() => toggleRevealAnswer(question.id, answer.id)}
                                    variant="ghost"
                                    className="text-white hover:text-quiz-yellow p-1 h-auto"
                                  >
                                    <EyeOff size={14} />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <Button
                            key={answer.id}
                            onClick={() => toggleRevealAnswer(question.id, answer.id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white h-10"
                          >
                            Answer {answer.id}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={addExtraQuestion} className="bg-green-600 hover:bg-green-700">
              <Plus className="mr-2" size={18} /> Add New Question
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Dialog version for normal modal view
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white text-quiz-purple border-quiz-purple hover:bg-purple-50"
        >
          Extra Questions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-blue-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-quiz-yellow text-2xl">Extra Questions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 mt-4">
          {extraQuestions.map((question) => (
            <div key={question.id} className="bg-blue-800 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">Question {question.id}</h3>
                <Button 
                  variant="ghost" 
                  className="text-quiz-yellow hover:text-yellow-300"
                  onClick={() => toggleRevealQuestion(question.id)}
                >
                  {revealedQuestions.includes(question.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              
              {editingQuestion === question.id ? (
                <div className="flex mb-4">
                  <Textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="flex-1 mr-2 bg-blue-700 text-white border-none"
                  />
                  <Button onClick={handleSaveQuestion} className="bg-green-600 hover:bg-green-700">
                    <Save size={18} />
                  </Button>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4 bg-blue-700 p-3 rounded">
                  <div>{question.text}</div>
                  <Button
                    onClick={() => startEditingQuestion(question.id, question.text)}
                    variant="ghost"
                    className="text-white hover:text-quiz-yellow"
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
              )}
              
              {revealedQuestions.includes(question.id) && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {question.answers.map((answer) => {
                    const isAnswerRevealed = revealedAnswers.some(item => 
                      item.questionId === question.id && item.answerId === answer.id
                    );
                    
                    return isAnswerRevealed ? (
                      <div key={answer.id} className="bg-blue-600 p-3 rounded flex justify-between items-center">
                        {editingAnswer?.questionId === question.id && editingAnswer?.answerId === answer.id ? (
                          <div className="flex w-full items-center">
                            <Input
                              value={answerText}
                              onChange={(e) => setAnswerText(e.target.value)}
                              className="flex-1 mr-2 bg-blue-700 text-white border-none"
                            />
                            <Input
                              type="number"
                              value={answerPoints}
                              onChange={(e) => setAnswerPoints(parseInt(e.target.value) || 0)}
                              className="w-16 mr-2 bg-blue-700 text-white border-none"
                            />
                            <Button onClick={handleSaveAnswer} className="bg-green-600 hover:bg-green-700">
                              <Save size={16} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span>{answer.text}</span>
                            <div className="flex items-center">
                              <span className="bg-quiz-yellow text-quiz-blue px-2 py-1 rounded font-bold text-sm mr-2">
                                {answer.points} pts
                              </span>
                              <Button
                                onClick={() => startEditingAnswer(question.id, answer.id, answer.text, answer.points)}
                                variant="ghost"
                                className="text-white hover:text-quiz-yellow p-1 h-auto"
                              >
                                <Edit2 size={14} />
                              </Button>
                              <Button
                                onClick={() => toggleRevealAnswer(question.id, answer.id)}
                                variant="ghost"
                                className="text-white hover:text-quiz-yellow p-1 h-auto"
                              >
                                <EyeOff size={14} />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <Button
                        key={answer.id}
                        onClick={() => toggleRevealAnswer(question.id, answer.id)}
                        className="bg-blue-600 hover:bg-blue-500 text-white h-10"
                      >
                        Answer {answer.id}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button onClick={addExtraQuestion} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" size={18} /> Add New Question
          </Button>
          <Button onClick={() => setIsFullScreen(true)} className="bg-quiz-yellow text-quiz-blue">
            View Full Screen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExtraQuestionsModal;
