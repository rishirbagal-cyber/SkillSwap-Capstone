
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Award, BookOpen, Star, TrendingUp, Zap, Target, Flame, Activity, Sparkles, Clock, CheckCircle, Hand } from 'lucide-react';

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
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full w-fit border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-700 dark:text-indigo-400">Neural Sync Active</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-indigo-600 dark:text-cyan-400">
               <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg animate-bounce">
                <Hand size={24} />
               </div>
               <span className="text-2xl font-black tracking-tight uppercase">Hello, {user.name.split(' ')[0]}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black font-heading tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
              Network <br/>
              <span className="text-indigo-600 dark:text-cyan-400">Command</span>
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-sm italic">"{insight}"</p>
        </div>
        
        <div className="flex gap-5 w-full md:w-auto">
          <div className="flex-1 md:w-40 glass p-6 rounded-[2rem] border-orange-100 dark:border-orange-500/20 text-center flex flex-col items-center group hover:bg-orange-50/30 transition-all cursor-default">
            <Flame className="text-orange-500 mb-2 group-hover:scale-125 transition-transform animate-pulse" size={28} />
            <div className="text-3xl font-black dark:text-white">{user.streak}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Day Streak</div>
          </div>
          <div className="flex-1 md:w-40 glass p-6 rounded-[2rem] border-cyan-100 dark:border-cyan-500/20 text-center flex flex-col items-center group hover:bg-cyan-50/30 transition-all cursor-default">
            <Zap className="text-cyan-500 mb-2 group-hover:scale-125 transition-transform" size={28} />
            <div className="text-3xl font-black dark:text-white">{user.points}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Total XP</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
        {/* Momentum Chart Section */}
        <div className="md:col-span-2 lg:col-span-4 neo-card p-8 md:p-10 rounded-[3rem] relative overflow-hidden flex flex-col min-h-[450px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <h3 className="text-2xl font-black flex items-center gap-4 dark:text-white">
              <div className="p-3 bg-indigo-500/10 rounded-2xl shadow-sm">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
              Neural Growth Curve
            </h3>
            <div className="px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Biometric Learning Stream
            </div>
          </div>
          
          <div className="w-full h-[320px] mt-auto relative block">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="vibrantGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={15} />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', fontWeight: '800', padding: '15px' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#vibrantGradient)" animationDuration={2500}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Neural Pulse / Activity Feed */}
        <div className="md:col-span-2 lg:col-span-2 glass p-8 rounded-[3rem] border-white/20 dark:border-white/5 flex flex-col">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3 dark:text-white">
            <Activity className="text-indigo-600" size={20} /> Neural Pulse
          </h3>
          <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
            {[
              { type: 'system', text: `Welcome, ${user.name}! Profile initialized.`, time: 'Just now', icon: Zap, color: 'text-indigo-500' },
              { type: 'session', text: 'Neural handshake protocols ready.', time: '1m ago', icon: CheckCircle, color: 'text-green-500' },
              { type: 'badge', text: 'Pending "Newbie Explorer" badge.', time: '2m ago', icon: Award, color: 'text-amber-500' },
              { type: 'streak', text: '1st Day of your streak! Day 1.', time: '5m ago', icon: Flame, color: 'text-orange-500' },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${act.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <act.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight truncate">{act.text}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-1 flex items-center gap-1"><Clock size={10}/> {act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full py-4 bg-slate-100 dark:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-all">Expand Log History</button>
        </div>

        {/* Mini Stats Footer */}
        <div className="md:col-span-2 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {[
            { label: 'Mastered Skills', val: user.strongSkills.length, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { label: 'Neural Reputation', val: user.skillReputation.toFixed(1), icon: Award, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Target Expertise', val: user.weakSkills.length, icon: Target, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' }
          ].map((s, i) => (
            <div key={i} className="neo-card p-8 rounded-[2.5rem] flex items-center gap-8 group cursor-default">
              <div className={`p-6 rounded-[1.5rem] ${s.bg} ${s.color} group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm`}>
                <s.icon size={32} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate mb-1">{s.label}</p>
                <p className="text-4xl font-black dark:text-white truncate tracking-tighter">{s.val}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
