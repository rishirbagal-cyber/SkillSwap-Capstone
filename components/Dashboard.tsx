import React, { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { firestoreService } from '../services/firestoreService';
import { auth } from '../services/firebase';

import { 
  Award, BookOpen, Star, TrendingUp, Zap, Target, Flame, 
  Activity, Sparkles, Clock, Users, BrainCircuit, ArrowRight, Globe
} from 'lucide-react';
import { Student } from '../types';
import { DEFAULT_AVATAR } from '../constants';

interface DashboardProps {
  onStartSession?: (partner: Student, skill: string) => void;
  isSyncing?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartSession, isSyncing }) => {
  const [user, setUser] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [insight] = useState<string>("Every skill you master today is a node in the network of your future.");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (auth.currentUser) {
      const unsubUser = firestoreService.subscribeToUser(auth.currentUser.uid, setUser);
      const unsubUsers = firestoreService.subscribeToUsers((allUsers) => {
        setStudents(allUsers.filter(s => s.uid !== auth.currentUser?.uid));
      });
      return () => {
        unsubUser();
        unsubUsers();
      };
    }
  }, []);



  const chartData = useMemo(() => {
    if (!user || !user.quizHistory || user.quizHistory.length === 0) {
      return [
        { name: 'Mon', score: 0 },
        { name: 'Tue', score: 0 },
        { name: 'Wed', score: 0 },
        { name: 'Thu', score: 0 },
        { name: 'Fri', score: 0 },
        { name: 'Sat', score: 0 },
        { name: 'Sun', score: 0 },
      ];
    }
    
    let mapped = user.quizHistory.map((q, i) => ({
      name: q.date.split('/')[0] + '/' + q.date.split('/')[1], // short date
      score: q.score
    }));

    if (mapped.length < 7) {
      const padding = Array(7 - mapped.length).fill(0).map((_, i) => ({ name: `-`, score: 0 }));
      mapped = [...padding, ...mapped];
    } else if (mapped.length > 7) {
      mapped = mapped.slice(mapped.length - 7);
    }
    
    return mapped;
  }, [user]);

  const recommendedMatches = useMemo(() => {
    if (!user) return [];
    return students.map(s => {
      const matchSkill = (s.strongSkills || []).find(sk => (user.weakSkills || []).includes(sk));
      let score = matchSkill ? 70 : 10;
      if (s.college === user.college) score += 20;
      return { 
        partner: s, 
        matchScore: Math.min(100, score),
        suggestedSkill: matchSkill || (s.strongSkills || [])[0] || ''
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
  }, [user, students]);

  if (!isMounted || !user) return null;

  const completedTopicsCount = (user.completedTopics || []).length;
  const sessionsCount = user.sessionsCount || 0;

  return (
    <div className="p-6 md:p-10 lg:p-16 space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full w-fit border border-indigo-100 dark:border-indigo-500/20">
            <div className={`w-2 h-2 rounded-full bg-indigo-600 ${isSyncing ? 'animate-bounce' : 'animate-ping'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400">
              {isSyncing ? 'Syncing Nodes...' : 'Network Interface Live'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-indigo-600 dark:text-cyan-400">
               <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center shadow-xl border-white/50 relative overflow-hidden">
                  <img src={user.avatar || DEFAULT_AVATAR} className={`w-16 h-16 object-cover ${isSyncing ? 'opacity-50' : ''}`} />
               </div>
               <div className="space-y-1">
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">Status: {user.rank}</span>
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Welcome back, {user.name.split(' ')[0]}</h2>
               </div>
            </div>
            <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tighter text-slate-900 dark:text-white leading-[0.85]">
              System <br/>
              <span className="text-indigo-600 dark:text-cyan-400">Overview</span>
            </h1>
          </div>
          <div className="glass p-5 rounded-[2rem] border-transparent max-w-sm">
            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold italic leading-relaxed">
              <Sparkles size={16} className="inline mr-2 text-indigo-500" />
              "{insight}"
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full lg:w-auto">
          <div className="glass p-6 rounded-[2.5rem] border-orange-100 dark:border-orange-500/20 text-center flex flex-col items-center group hover:scale-105 transition-all">
            <Flame className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <div className="text-3xl font-black dark:text-white">{user.streak || 0}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Daily Streak</div>
          </div>
          <div className="glass p-6 rounded-[2.5rem] border-cyan-100 dark:border-cyan-500/20 text-center flex flex-col items-center group hover:scale-105 transition-all">
            <Zap className="text-cyan-500 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <div className="text-3xl font-black dark:text-white">{user.points || 0}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Total Power</div>
          </div>
          <div className="hidden md:flex glass p-6 rounded-[2.5rem] border-indigo-100 dark:border-indigo-500/20 text-center flex flex-col items-center group hover:scale-105 transition-all">
            <Globe className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <div className="text-3xl font-black dark:text-white">#1</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Global Rank</div>
          </div>
        </div>
      </header>

      {/* Smart Recommendations Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-4">
          <h3 className="text-xl font-black flex items-center gap-3 dark:text-white uppercase tracking-tighter">
            <BrainCircuit className="text-indigo-600" size={24} /> Top Matches for You
          </h3>
          <button className="text-[10px] font-black uppercase text-indigo-600 tracking-widest flex items-center gap-2 group hover:translate-x-1 transition-all">
            See Neural Network <ArrowRight size={14} />
          </button>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-6 custom-scrollbar scroll-smooth px-2">
          {recommendedMatches.length > 0 ? recommendedMatches.map((m, i) => (
            <div key={i} className="neo-card min-w-[300px] p-6 rounded-[2.5rem] flex flex-col gap-6 group hover:border-indigo-600/50 transition-all border-transparent">
              <div className="flex justify-between items-start">
                <div className="relative">
                  <img src={m.partner.avatar || DEFAULT_AVATAR} className="w-14 h-14 rounded-2xl shadow-lg border-2 border-white dark:border-white/10" />
                </div>
                <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full text-[9px] font-black text-indigo-600 border border-indigo-100 dark:border-indigo-500/20">
                  {m.matchScore}% Neural Match
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{m.partner.name}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{m.partner.college}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                 <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Expert in</p>
                 <p className="text-xs font-black dark:text-white">{m.suggestedSkill}</p>
              </div>
              <button 
                onClick={() => onStartSession?.(m.partner, m.suggestedSkill)}
                className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all hover:bg-indigo-700"
              >
                Instant Sync
              </button>
            </div>
          )) : (
            <div className="w-full p-12 glass rounded-3xl text-center text-slate-500 font-bold">
              The neural network is currently empty. More peers will appear as they join.
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Momentum Chart Section */}
        <div className="lg:col-span-8 neo-card p-8 md:p-10 rounded-[3rem] md:rounded-[4rem] flex flex-col min-h-[500px] overflow-visible">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
            <h3 className="text-2xl font-black flex items-center gap-4 dark:text-white">
              <div className="p-4 bg-indigo-500/10 rounded-3xl">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              Knowledge Accumulation
            </h3>
            <div className="px-6 py-2.5 glass rounded-2xl border-slate-100 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Rolling 7-Day Matrix
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px] relative">
          <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(99,102,241,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} dy={15} height={40} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: '900', padding: '20px', background: 'rgba(255,255,255,0.9)' }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={6} fillOpacity={1} fill="url(#chartGradient)" animationDuration={3000}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pulse & Activity */}
        <div className="lg:col-span-4 flex flex-col gap-10">
          <div className="glass p-10 rounded-[3.5rem] border-white/20 dark:border-white/5 flex flex-col h-full">
            <h3 className="text-xl font-black mb-10 flex items-center gap-4 dark:text-white">
              <Activity className="text-indigo-600" size={20} /> Neural Activity
            </h3>
            <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar flex-1 max-h-[400px]">
              {[
                { text: `Profile Synced to Firestore.`, time: 'Now', icon: Target, color: 'text-indigo-500' },
                { text: `${sessionsCount} active learning sessions.`, time: 'Recent', icon: Users, color: 'text-green-500' },
                { text: `${completedTopicsCount} topics mastered.`, time: 'Ongoing', icon: BookOpen, color: 'text-amber-500' },
              ].map((act, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className={`p-3 rounded-2xl bg-white dark:bg-slate-800 ${act.color} group-hover:scale-110 transition-all shadow-md`}>
                    <act.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-200 leading-tight mb-2">{act.text}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5"><Clock size={10}/> {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            { label: 'Skills Mastered', val: completedTopicsCount, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Network Reputation', val: (user.skillReputation || 1).toFixed(1), icon: Award, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Sessions Completed', val: sessionsCount, icon: Target, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
            { label: 'Mentor Rating', val: user.teachingScore || 0, icon: Star, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10' }
          ].map((s, i) => (
            <div key={i} className="neo-card p-10 rounded-[3rem] flex items-center gap-10 group hover:translate-y-[-5px] transition-all">
              <div className={`p-6 rounded-[2rem] ${s.bg} ${s.color} group-hover:scale-110 transition-all shadow-inner`}>
                <s.icon size={36} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-5xl font-black dark:text-white tracking-tighter leading-none">{s.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
