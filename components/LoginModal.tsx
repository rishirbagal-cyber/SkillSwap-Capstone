
import React, { useState, useEffect } from 'react';
import { X, User, GraduationCap, BookOpen, Zap, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Student } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (name: string, college: string, branch: string, strongSkills: string[], weakSkills: string[]) => void;
  currentUser: Student | null;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, currentUser }) => {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [strongSkills, setStrongSkills] = useState<string[]>([]);
  const [weakSkills, setWeakSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [skillType, setSkillType] = useState<'strong' | 'weak'>('strong');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setCollege(currentUser.college);
      setBranch(currentUser.branch);
      setStrongSkills(currentUser.strongSkills);
      setWeakSkills(currentUser.weakSkills);
    } else {
      setName('');
      setCollege('');
      setBranch('');
      setStrongSkills(['Communication']);
      setWeakSkills(['Programming']);
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (skillType === 'strong') {
      if (!strongSkills.includes(newSkill)) setStrongSkills([...strongSkills, newSkill]);
    } else {
      if (!weakSkills.includes(newSkill)) setWeakSkills([...weakSkills, newSkill]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string, type: 'strong' | 'weak') => {
    if (type === 'strong') setStrongSkills(strongSkills.filter(s => s !== skill));
    else setWeakSkills(weakSkills.filter(s => s !== skill));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name, college, branch, strongSkills, weakSkills);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass p-8 md:p-10 rounded-[3rem] border-white/20 dark:border-white/5 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-indigo-600 transition-colors">
          <X size={20} />
        </button>

        <div className="mb-8 text-center space-y-3">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
            <Zap size={32} fill="white" />
          </div>
          <h2 className="text-3xl font-black tracking-tight dark:text-white">
            {currentUser ? 'Neural Identity' : 'Establish Identity'}
          </h2>
          <p className="text-slate-500 text-sm font-medium italic">Configure your peer-exchange parameters</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Basic Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full glass pl-14 pr-6 py-4 rounded-2xl outline-none border-transparent focus:border-indigo-600 transition-all font-bold text-slate-900 dark:text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">College</label>
              <div className="relative group">
                <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input type="text" required value={college} onChange={(e) => setCollege(e.target.value)} placeholder="College" className="w-full glass pl-14 pr-6 py-4 rounded-2xl outline-none border-transparent focus:border-indigo-600 transition-all font-bold text-slate-900 dark:text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Branch</label>
              <div className="relative group">
                <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input type="text" required value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch" className="w-full glass pl-14 pr-6 py-4 rounded-2xl outline-none border-transparent focus:border-indigo-600 transition-all font-bold text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Right Column: Skills */}
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Skills Network</label>
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-xl">
                <button type="button" onClick={() => setSkillType('strong')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${skillType === 'strong' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Mastery</button>
                <button type="button" onClick={() => setSkillType('weak')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${skillType === 'weak' ? 'bg-fuchsia-600 text-white shadow-lg' : 'text-slate-400'}`}>Target</button>
              </div>
              
              <div className="relative">
                <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())} placeholder={`Add ${skillType} skill...`} className="w-full glass px-6 py-4 rounded-2xl outline-none border-transparent focus:border-indigo-600 transition-all font-bold text-sm text-slate-900 dark:text-white" />
                <button type="button" onClick={handleAddSkill} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-200 dark:bg-white/10 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Plus size={16} /></button>
              </div>

              <div className="space-y-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex flex-wrap gap-2">
                  {strongSkills.map(s => (
                    <span key={s} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100">
                      {s} <button type="button" onClick={() => removeSkill(s, 'strong')}><Trash2 size={10} /></button>
                    </span>
                  ))}
                  {weakSkills.map(s => (
                    <span key={s} className="flex items-center gap-2 px-3 py-1.5 bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600 rounded-lg text-[10px] font-black border border-fuchsia-100">
                      {s} <button type="button" onClick={() => removeSkill(s, 'weak')}><Trash2 size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button type="submit" className="md:col-span-2 w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3">
            {currentUser ? 'Update Profile' : 'Launch Link'} <Sparkles size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
