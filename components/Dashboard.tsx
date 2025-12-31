import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
/* Fix: Import missing Users icon from lucide-react */
import { 
  Award, BookOpen, Star, TrendingUp, Zap, Target, Flame, 
  Activity, Sparkles, Clock, CheckCircle, Hand, Globe, Users
} from 'lucide-react';

const data = [
  { name: 'Mon', score: 120 },
  { name: 'Tue', score: 300 },
  { name: 'Wed', score: 200 },
  { name: 'Thu', score: 450 },
  { name: 'Fri', score: 600 },
  { name: 'Sat', score: 550 },
  { name: 'Sun', score: 700 },
];

const Dashboard: React.FC = () => {
  const user = storageService.getCurrentUser();
  const [insight, setInsight] = useState<string>("Syncing neural nodes...");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchInsight = async () => {
      try {
        if (!user) return;
        const res = await geminiService.getGrowthInsight([...(user?.strongSkills || []), ...(user?.weakSkills || [])]);
        setInsight(res);
      } catch (e) {
        setInsight("Your progress is accelerating across all mastery nodes.");
      }
    };
    fetchInsight();
  }, [user]);

  if (!isMounted || !user) return null;

  return (
    <div className="p-6 md:p-10 lg:p-16 space-y-12 animate-in fade-in duration-1000">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full w-fit border border-indigo-100 dark:border-indigo-500/20">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400">Network Interface Live</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-indigo-600 dark:text-cyan-400">
               <div className="w-16 h-16 glass rounded-3xl flex items-center justify-center shadow-xl border-white/50">
                  <img src={user.avatar} className="w-12 h-12 rounded-2xl" />
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
            <div className="text-3xl font-black dark:text-white">{user.streak}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Daily Streak</div>
          </div>
          <div className="glass p-6 rounded-[2.5rem] border-cyan-100 dark:border-cyan-500/20 text-center flex flex-col items-center group hover:scale-105 transition-all">
            <Zap className="text-cyan-500 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <div className="text-3xl font-black dark:text-white">{user.points}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Total Power</div>
          </div>
          <div className="hidden md:flex glass p-6 rounded-[2.5rem] border-indigo-100 dark:border-indigo-500/20 text-center flex flex-col items-center group hover:scale-105 transition-all">
            <Globe className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" size={32} />
            <div className="text-3xl font-black dark:text-white">#42</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Global Rank</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Momentum Chart Section */}
        <div className="lg:col-span-8 neo-card p-10 rounded-[4rem] relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
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
          
          <div className="w-full h-[350px] mt-auto relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(99,102,241,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '800'}} dy={20} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontWeight: '900', padding: '20px' }}
                />
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
            <div className="space-y-10 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {[
                { text: `Profile updated. Target node: ${user.weakSkills[0]}`, time: '2h ago', icon: Target, color: 'text-indigo-500' },
                { text: 'New Peer Match detected nearby', time: '4h ago', icon: Users, color: 'text-green-500' },
                { text: 'XP Multiplier active for Academics', time: '1d ago', icon: Award, color: 'text-amber-500' },
                { text: 'Weekly Digest generated', time: '2d ago', icon: BookOpen, color: 'text-fuchsia-500' },
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

        {/* Dynamic Cards Footer */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            { label: 'Verified Mastery', val: user.strongSkills.length, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Network Reputation', val: user.skillReputation.toFixed(1), icon: Award, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Learning Targets', val: user.weakSkills.length, icon: Target, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
            { label: 'Mentor Rating', val: user.teachingScore, icon: Star, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10' }
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