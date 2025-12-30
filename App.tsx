
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Matching from './components/Matching';
import SessionModule from './components/SessionModule';
import Leaderboard from './components/Leaderboard';
import LoginModal from './components/LoginModal';
import { storageService } from './services/storageService';
import { Student, Skill } from './types';
import { Menu, Zap, Bell, Layout, Users, Trophy, Target, LogIn, User, Sparkles, ArrowRight, Ghost } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isDark, setIsDark] = useState(storageService.getTheme());
  const [activeSession, setActiveSession] = useState<{ partner: Student; skill: Skill } | null>(null);
  const [user, setUser] = useState<Student | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    storageService.init();
    const currentUser = storageService.getCurrentUser();
    // Start with NO NAME (null user) unless previously saved in localStorage
    setUser(currentUser);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storageService.setTheme(isDark);
  }, [isDark]);

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveSession(null);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    setActiveTab('dashboard');
    setActiveSession(null);
    setIsSidebarOpen(false);
    triggerNotification("Session Terminated. Neural Link Disconnected.");
  };

  const handleStartSession = (partner: Student, skill: Skill) => {
    setActiveSession({ partner, skill });
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishSession = (quizScore: number) => {
    if (!user) return;
    const xpGained = 150 + (quizScore * 100);
    const updatedUser = {
      ...user,
      points: user.points + xpGained,
      streak: user.streak + 1,
      skillReputation: user.skillReputation + 0.1
    };
    storageService.updateUser(updatedUser);
    setUser(updatedUser);
    setActiveSession(null);
    setActiveTab('dashboard');
    triggerNotification(`Success! Gained ${xpGained} XP and +0.1 Rep`);
  };

  const handleLogin = (name: string, college: string, branch: string, strongSkills: string[], weakSkills: string[]) => {
    let updatedUser: Student;
    
    if (user) {
      updatedUser = { ...user, name, college, branch, strongSkills, weakSkills };
    } else {
      updatedUser = {
        id: `user-${Date.now()}`,
        name,
        college,
        branch,
        year: 1,
        strongSkills,
        weakSkills,
        teachingScore: 0,
        learningScore: 0,
        skillReputation: 1,
        points: 0,
        rank: 'Novice',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        badges: [],
        streak: 0
      };
    }
    
    storageService.updateUser(updatedUser);
    setUser(updatedUser);
    setIsLoginModalOpen(false);
    triggerNotification(`Hello, ${name.split(' ')[0]}! Neural Link Established.`);
  };

  if (!isInitialized) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-indigo-400 font-black tracking-widest text-xs uppercase animate-pulse">Initializing Neural Handshake...</p>
    </div>
  );

  // ONBOARDING GATEWAY (User must setup profile first)
  if (!user) return (
    <div className={`${isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-900 bg-[#f8faff]'} min-h-screen transition-colors duration-500 flex items-center justify-center p-6 relative overflow-hidden`}>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]"></div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} currentUser={null} />
      
      <div className="relative z-10 max-w-2xl w-full glass p-10 md:p-16 rounded-[4rem] text-center space-y-12 shadow-2xl animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-fuchsia-600 rounded-[2.5rem] flex items-center justify-center text-white relative z-10 shadow-2xl transform hover:rotate-12 transition-transform cursor-pointer">
            <Zap size={48} className="fill-current animate-float" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            Welcome to <br/><span className="text-indigo-600 dark:text-cyan-400">SkillSwap</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-sm mx-auto italic">
            "Peer learning is the future of intelligence."
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 glass rounded-[2rem] text-left border-transparent bg-white/40 dark:bg-white/5">
             <div className="text-indigo-600 dark:text-cyan-400 mb-2 font-black">01</div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Knowledge Pool</p>
             <p className="text-xs font-bold mt-1">Access 100+ skills from peers.</p>
          </div>
          <div className="p-6 glass rounded-[2rem] text-left border-transparent bg-white/40 dark:bg-white/5">
             <div className="text-fuchsia-600 mb-2 font-black">02</div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Neural Matching</p>
             <p className="text-xs font-bold mt-1">AI-powered pairing logic.</p>
          </div>
        </div>

        <button 
          onClick={() => setIsLoginModalOpen(true)} 
          className="group w-full bg-indigo-600 text-white px-12 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/40 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 mx-auto"
        >
          Setup Neural Profile <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`${isDark ? 'text-slate-100 bg-slate-950' : 'text-slate-900 bg-[#f8faff]'} min-h-screen transition-colors duration-500`}>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} currentUser={user} />
      
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-10 duration-500 pointer-events-none">
          <div className="glass px-6 py-4 rounded-3xl border-indigo-200 dark:border-indigo-500/30 shadow-2xl flex items-center gap-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg"><Bell size={14} /></div>
            <span className="text-sm font-black text-indigo-900 dark:text-white">{notification}</span>
          </div>
        </div>
      )}

      <header className="md:hidden sticky top-0 z-40 p-4 bg-inherit/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"><Menu size={20} /></button>
          <div className="flex items-center gap-2"><Zap size={22} className="text-indigo-600 dark:text-cyan-400 fill-current" /><span className="font-black text-xl tracking-tighter">SkillSwap</span></div>
          <button onClick={() => setIsLoginModalOpen(true)} className="relative group">
            <img src={user.avatar} className="w-10 h-10 rounded-2xl object-cover ring-2 ring-indigo-500 transition-transform active:scale-90" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
          </button>
        </div>
      </header>

      <div className="flex relative">
        <aside className={`fixed md:sticky top-0 h-screen z-50 transition-transform duration-500 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} isDark={isDark} toggleDark={() => setIsDark(!isDark)} onLogout={handleLogout} onClose={() => setIsSidebarOpen(false)}/>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="p-4 md:p-8 lg:p-12">
             <div className={`mx-auto max-w-7xl glass min-h-[85vh] rounded-[2.5rem] md:rounded-[4rem] border-white/50 dark:border-white/5 shadow-2xl overflow-hidden transition-all relative ${activeSession ? 'md:max-w-full' : ''}`}>
               
               {!activeSession && (
                 <div className="absolute top-8 right-8 z-30 hidden md:block">
                   <button 
                    onClick={() => setIsLoginModalOpen(true)} 
                    className="flex items-center gap-4 px-6 py-4 glass text-slate-900 dark:text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border-indigo-100 dark:border-white/10 hover:border-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-sm"
                   >
                     <User size={16} className="text-indigo-600" />
                     <span>Network Identity</span>
                   </button>
                 </div>
               )}

               {activeSession ? (
                 <SessionModule partner={activeSession.partner} skill={activeSession.skill} onFinish={handleFinishSession} onCancel={() => setActiveSession(null)} />
               ) : (
                 <div className="pb-24 md:pb-0">
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'matching' && <Matching onStartSession={handleStartSession} />}
                    {activeTab === 'leaderboard' && <Leaderboard />}
                    {activeTab === 'sessions' && (
                      <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-xl shadow-indigo-100/50 dark:shadow-none">
                          <Ghost size={40} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tight">Ethereal History</h2>
                        <p className="text-slate-500 max-w-sm font-medium leading-relaxed italic">Your learning journey is being indexed. Complete your first match to see records here.</p>
                        <button onClick={() => handleTabChange('matching')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all">Start Matching</button>
                      </div>
                    )}
                    {activeTab === 'marketplace' && (
                      <div className="h-[70vh] flex flex-col items-center justify-center text-center p-12 space-y-8">
                         <h2 className="text-8xl font-black text-slate-100 dark:text-slate-800 tracking-tighter uppercase italic select-none">V2 CORE</h2>
                         <div className="space-y-2">
                           <p className="text-indigo-600 font-black tracking-[0.4em] uppercase text-xs">Unlocking Next Quarter</p>
                           <p className="text-slate-400 font-medium text-sm">Exclusive learning assets and badge upgrades.</p>
                         </div>
                      </div>
                    )}
                 </div>
               )}
             </div>
          </div>
        </main>
      </div>

      {!activeSession && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 glass px-6 py-4 rounded-[2.5rem] border-white/20 dark:border-white/10 shadow-2xl flex items-center justify-around">
          {[
            { id: 'dashboard', icon: Layout },
            { id: 'matching', icon: Users },
            { id: 'leaderboard', icon: Trophy },
            { id: 'marketplace', icon: Target }
          ].map(item => (
            <button key={item.id} onClick={() => handleTabChange(item.id)} className={`p-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'text-slate-400'}`}><item.icon size={20} /></button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;
