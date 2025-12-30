
import React, { useState, useMemo } from 'react';
import { storageService } from '../services/storageService';
import { Match, Student, Skill } from '../types';
import { Heart, Search, Sparkles, Zap, MessageCircle, ArrowUpRight, User, ExternalLink } from 'lucide-react';

interface MatchingProps {
  onStartSession: (partner: Student, skill: Skill) => void;
}

const Matching: React.FC<MatchingProps> = ({ onStartSession }) => {
  const currentUser = storageService.getCurrentUser();
  const students = storageService.getStudents().filter(s => s.id !== currentUser.id);
  const [searchTerm, setSearchTerm] = useState('');

  const matches: Match[] = useMemo(() => {
    return students.map(s => {
      const teacherCanTeach = s.strongSkills.find(sk => currentUser.weakSkills.includes(sk));
      const learnerCanTeach = currentUser.strongSkills.find(sk => s.weakSkills.includes(sk));
      let percentage = 0;
      if (teacherCanTeach) percentage += 50;
      if (learnerCanTeach) percentage += 50;
      return {
        partner: s,
        matchPercentage: percentage,
        mutualStrongSkill: teacherCanTeach || s.strongSkills[0],
        mutualWeakSkill: learnerCanTeach || currentUser.strongSkills[0]
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [currentUser, students]);

  const filteredMatches = matches.filter(m => 
    m.partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.partner.strongSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 overflow-visible">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-full w-fit border border-indigo-100 dark:border-indigo-500/20">
            <Sparkles size={14} className="text-indigo-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-400">Advanced Match Algorithm</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
            Peer <span className="text-indigo-600 dark:text-cyan-400">Discovery</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium max-w-md">
            Connecting you with the best student mentors across the campus neural network.
          </p>
        </div>
        
        <div className="relative group w-full xl:max-w-md">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-0 group-focus-within:opacity-10 transition-opacity"></div>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" size={20} />
          <input 
            type="text"
            placeholder="Search expertise, names, or colleges..."
            className="w-full glass pl-14 pr-6 py-5 rounded-[2rem] border-transparent focus:border-indigo-600 outline-none transition-all font-bold tracking-tight text-slate-900 dark:text-white shadow-xl relative z-0"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
        {filteredMatches.length > 0 ? filteredMatches.map((match) => (
          <div key={match.partner.id} className="neo-card rounded-[3rem] p-8 group relative flex flex-col h-full border-slate-100 dark:border-white/5 transition-all hover:shadow-2xl">
            
            {/* Compatibility Badge - Integrated into Header to avoid overlap */}
            <div className="flex justify-between items-start mb-6">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-indigo-500 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <img 
                  src={match.partner.avatar} 
                  className="relative w-20 h-20 rounded-[2rem] object-cover border-4 border-white dark:border-white/10 shadow-lg" 
                />
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-600 leading-none">{match.matchPercentage}%</div>
                <div className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Match Score</div>
                <div className="mt-4 flex items-center justify-end gap-1.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-[9px] font-black uppercase text-slate-400">Available</span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="mb-6">
              <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white truncate pr-4">{match.partner.name}</h4>
              <p className="text-[11px] text-slate-500 font-bold mt-1 italic truncate">{match.partner.college}</p>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase mt-1 tracking-wider">{match.partner.branch}</p>
            </div>

            {/* Expertise Area */}
            <div className="space-y-6 flex-1 mb-8">
              <div className="p-6 bg-slate-50/50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                   <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-md">
                     <Zap size={12} fill="white" />
                   </div>
                   <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Mastery Skills</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.partner.strongSkills.slice(0, 4).map(s => (
                    <span 
                      key={s} 
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border ${
                        currentUser.weakSkills.includes(s) 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105' 
                        : 'bg-white dark:bg-white/10 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/5'
                      }`}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Neural Insight */}
              <div className="px-4 border-l-2 border-indigo-200 dark:border-indigo-500/20">
                <h5 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Matching Insight</h5>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-medium italic">
                  {match.matchPercentage === 100 
                    ? `Perfect reciprocal swap detected for ${match.mutualStrongSkill}.` 
                    : `${match.partner.name.split(' ')[0]} is globally ranked for ${match.mutualStrongSkill}.`}
                </p>
              </div>
            </div>

            {/* Action Bar - More buttons and better arrangement */}
            <div className="space-y-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => onStartSession(match.partner, match.mutualStrongSkill)}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 group/link"
                >
                  Establish Link <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </button>
                <button className="p-4 glass rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-white/10 transition-all">
                  <MessageCircle size={18} />
                </button>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 glass py-3 rounded-xl font-bold text-[9px] uppercase tracking-[0.15em] text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                  <User size={12} /> View Profile
                </button>
                <button className="flex-1 glass py-3 rounded-xl font-bold text-[9px] uppercase tracking-[0.15em] text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center justify-center gap-2">
                  <ExternalLink size={12} /> Projects
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-32 text-center opacity-40 flex flex-col items-center gap-8">
            <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
              <User size={48} className="text-slate-300" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-2xl tracking-tight">Node Not Found</p>
              <p className="text-sm font-medium">Try searching for broader skills like 'Web' or 'Python'.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Matching;
