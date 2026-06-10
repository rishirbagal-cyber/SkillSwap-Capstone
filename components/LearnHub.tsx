import React, { useState, useEffect, useRef } from 'react';
import { Book, CheckCircle, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import { auth } from '../services/firebase';
import { firestoreService } from '../services/firestoreService';
import { geminiService } from '../services/geminiService';
import { Student } from '../types';

const LearnHub: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (auth.currentUser) {
      return firestoreService.subscribeToUser(auth.currentUser.uid, setCurrentUser);
    }
  }, []);

  // AbortController ref — cancels in-flight Gemini request on unmount (Strict Mode safe).
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const generateNotes = async (topic: string) => {
    // Guard: if already generating, ignore click (prevents concurrent requests).
    if (isGenerating) return;
    // Abort any previous in-flight request before starting a new one.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setActiveTopic(topic);
    setNotes(null);
    setIsGenerating(true);
    try {
      const content = await geminiService.generateTopicNotes(topic, controller.signal);
      if (controller.signal.aborted) return;
      setNotes(content);
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setNotes(
        e.message?.includes('rate limit')
          ? '⚠️ Rate limit reached (429). Please wait ~60 seconds and try again.'
          : 'Failed to generate notes. Please try again.'
      );
    } finally {
      if (!controller.signal.aborted) setIsGenerating(false);
    }
  };

  const markAsLearned = async (topic: string) => {
    if (!currentUser || !auth.currentUser) return;
    
    const completed = currentUser.completedTopics || [];
    if (!completed.includes(topic)) {
      await firestoreService.updateUser(auth.currentUser.uid, {
        completedTopics: [...completed, topic],
        points: (currentUser.points || 0) + 500, // Bonus for completing a topic
      });
    }
    setActiveTopic(null);
  };

  if (!currentUser) return null;

  const targetSkills = currentUser.weakSkills || [];
  const completedTopics = currentUser.completedTopics || [];

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-8 animate-in fade-in duration-700">
      <header className="space-y-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">
          Learn <span className="text-indigo-600 dark:text-cyan-400">Hub</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Master your target skills with AI-generated notes and practice questions.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-1 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Book className="text-indigo-600" /> Target Skills
          </h3>
          {targetSkills.map(skill => {
            const isCompleted = completedTopics.includes(skill);
            const isActive = activeTopic === skill;
            return (
              <div 
                key={skill}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                  isActive ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' 
                  : isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                  : 'border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-indigo-300'
                }`}
                onClick={() => !isCompleted && generateNotes(skill)}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className={`font-black text-xl ${isCompleted ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
                    {skill}
                  </h4>
                  {isCompleted && <CheckCircle className="text-green-500" />}
                </div>
                
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'w-full bg-green-500' : 'w-0 bg-indigo-600'}`}></div>
                </div>

                {!isCompleted && (
                  <button 
                    disabled={isGenerating && isActive}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex justify-center items-center gap-2 hover:bg-indigo-700 transition-colors"
                  >
                    {isGenerating && isActive ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                    {isGenerating && isActive ? 'Generating...' : 'Generate Notes'}
                  </button>
                )}
              </div>
            );
          })}
          {targetSkills.length === 0 && (
            <div className="p-8 text-center text-slate-500 glass rounded-3xl">
              No target skills found. Update your profile!
            </div>
          )}
        </div>

        <div className="col-span-1 lg:col-span-2">
          {activeTopic ? (
            <div className="glass rounded-[3rem] p-8 md:p-12 border-white/20 shadow-2xl relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex justify-between items-end mb-8 relative z-10">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  Notes: <span className="text-indigo-600">{activeTopic}</span>
                </h3>
              </div>

              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6 text-indigo-600">
                  <BrainCircuit size={48} className="animate-pulse" />
                  <p className="font-bold animate-pulse">Gemini is synthesizing knowledge...</p>
                </div>
              ) : notes ? (
                <div className="space-y-8 relative z-10">
                  <div className="prose dark:prose-invert prose-indigo max-w-none">
                    {/* Very simple markdown renderer since we don't have react-markdown installed */}
                    {notes.split('\n').map((line, i) => {
                      if (line.startsWith('##')) return <h3 key={i} className="text-xl font-bold mt-6 mb-2">{line.replace(/#/g, '')}</h3>;
                      if (line.startsWith('**')) return <p key={i} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
                      if (line.startsWith('-')) return <li key={i} className="ml-4">{line.replace('-', '')}</li>;
                      if (line.trim() === '') return <br key={i} />;
                      return <p key={i} className="my-2">{line}</p>;
                    })}
                  </div>
                  
                  <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-8">
                    <button 
                      onClick={() => markAsLearned(activeTopic)}
                      className="w-full py-5 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle /> Mark as Learned (+500 XP)
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
             <div className="h-full min-h-[400px] glass rounded-[3rem] flex flex-col items-center justify-center text-center p-12 text-slate-400">
               <BrainCircuit size={64} className="mb-6 opacity-50" />
               <h3 className="text-2xl font-bold mb-2">Select a Topic</h3>
               <p className="max-w-xs">Click "Generate Notes" on any of your target skills to let Gemini prepare a custom study guide.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnHub;
