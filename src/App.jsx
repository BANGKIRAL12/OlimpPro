import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, HelpCircle, Key, RefreshCcw, CheckCircle2, 
  XCircle, ChevronRight, Target, Award, Home, 
  BrainCircuit, GraduationCap, ChevronLeft, BarChart3, Star, Zap, ShieldCheck,
  Calculator, Pi, FunctionSquare, LayoutGrid, Gem, Crown, Flame, Microscope, Globe2, BookOpen
} from 'lucide-react';

/**
 * FORMAT PENGISIAN SOAL:
 * Copy-paste struktur di bawah ini ke dalam kategori yang sesuai.
 * { 
 * id: 'unik-123', 
 * bidang: 'Nama Sub-Bab', 
 * pertanyaan: 'Gunakan $...$ untuk simbol matematika', 
 * jawabanBenar: 'Jawaban', 
 * opsiLain: ['Salah1', 'Salah2', 'Salah3'], 
 * pembahasan: 'Penjelasan singkat' 
 * }
 */

const SOAL_DATABASE = {
  matematika: {
    sd: {
      kabupaten: [
        { id: 'mtksdk1', bidang: 'Aljabar', pertanyaan: "Jika $3n + 7 = 22$, nilai dari $n - 2$ adalah...", jawabanBenar: "3", opsiLain: ["5", "15", "7"], pembahasan: "$3n = 22 - 7 \\implies 3n = 15 \\implies n = 5$. Maka $n - 2 = 5 - 2 = 3$." },
      ],
      provinsi: [], nasional: []
    },
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  },
  ipa: {
    sd: {
      kabupaten: [
        { id: 'ipasdk1', bidang: 'Biologi', pertanyaan: "Bagian sel tumbuhan yang berfungsi sebagai tempat terjadinya fotosintesis adalah...", jawabanBenar: "Kloroplas", opsiLain: ["Mitokondria", "Ribosom", "Vakuola"], pembahasan: "Kloroplas mengandung klorofil yang menangkap cahaya matahari untuk proses fotosintesis." },
      ],
      provinsi: [], nasional: []
    },
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  },
  ips: {
    smp: {
      kabupaten: [
        { id: 'ipssmpk1', bidang: 'Geografi', pertanyaan: "Negara di Asia Tenggara yang tidak memiliki garis pantai adalah...", jawabanBenar: "Laos", opsiLain: ["Vietnam", "Kamboja", "Thailand"], pembahasan: "Laos adalah satu-satunya negara di Asia Tenggara yang wilayahnya dikelilingi daratan (landlocked)." },
      ],
      provinsi: [], nasional: []
    }
  }
};

const fillTo25 = (pool, subject, grade, level) => {
  if (pool.length >= 25) return pool;
  const needed = 25 - pool.length;
  const mockData = [];
  for (let i = 0; i < needed; i++) {
    mockData.push({
      id: `mock-${subject}-${grade}-${level}-${i}`,
      bidang: 'Simulasi',
      pertanyaan: `[Soal Simulasi ${subject.toUpperCase()} ${i+1}] Berapa hasil dari $15 \\times 3 + 5$ ?`,
      jawabanBenar: "50",
      opsiLain: ["45", "55", "60"],
      pembahasan: "$45 + 5 = 50$."
    });
  }
  return [...pool, ...mockData];
};

const MathText = ({ text }) => {
  if (!text) return null;
  const parts = text.split(/(\$.*?\$)/g);
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          let content = part.slice(1, -1);
          content = content.replace(/\\sqrt/g, '√').replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\implies/g, '→').replace(/\\dots/g, '...');
          return <span key={i} className="font-serif italic mx-0.5 text-indigo-400 font-bold">{content}</span>;
        }
        return part;
      })}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [subject, setSubject] = useState('matematika');
  const [grade, setGrade] = useState(null);
  const [level, setLevel] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const explanationRef = useRef(null);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('math_olympiad_v3_stats');
    return saved ? JSON.parse(saved) : { totalPoin: 0, totalSesi: 0, history: [] };
  });

  useEffect(() => {
    localStorage.setItem('math_olympiad_v3_stats', JSON.stringify(stats));
  }, [stats]);

  // Auto-scroll ke pembahasan
  useEffect(() => {
    if (showExplanation && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showExplanation]);

  const RANKS = [
    { id: 1, title: "Perunggu", min: 0, color: "text-orange-500", bg: "bg-orange-100", border: "border-orange-200", icon: <Award size={32} /> },
    { id: 2, title: "Perak", min: 1000, color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", icon: <ShieldCheck size={32} /> },
    { id: 3, title: "Emas", min: 3000, color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", icon: <Trophy size={32} /> },
    { id: 4, title: "Diamond", min: 7000, color: "text-cyan-400", bg: "bg-cyan-100", border: "border-cyan-200", icon: <Gem size={32} /> },
    { id: 5, title: "Legend", min: 15000, color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200", icon: <Flame size={32} /> },
    { id: 6, title: "Mythic", min: 30000, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-200", icon: <Crown size={32} /> },
  ];

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(r => stats.totalPoin >= r.min) || RANKS[0];
  }, [stats.totalPoin]);

  const nextRank = useMemo(() => RANKS.find(r => r.min > stats.totalPoin), [stats.totalPoin]);

  const startQuiz = (g, l) => {
    const pool = SOAL_DATABASE[subject]?.[g]?.[l] || [];
    const fullPool = fillTo25(pool, subject, g, l);
    const shuffled = [...fullPool].sort(() => Math.random() - 0.5).slice(0, 25);
    
    setQuestions(shuffled);
    setGrade(g);
    setLevel(l);
    setQuizActive(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  const handleAnswer = (ans) => {
    if (selectedAnswer) return;
    setSelectedAnswer(ans);
    if (ans === questions[currentIndex].jawabanBenar) {
      setScore(s => s + 4);
    }
    setTimeout(() => setShowExplanation(true), 400);
  };

  const finishQuiz = () => {
    setStats(prev => ({
      totalPoin: prev.totalPoin + score,
      totalSesi: prev.totalSesi + 1,
      history: [{ date: new Date().toLocaleDateString(), score, grade, level, subject }, ...prev.history].slice(0, 10)
    }));
    setShowResult(true);
  };

  const renderBeranda = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter">OLYMPIA<span className="text-indigo-600">PRO</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Multi-Subject Simulator</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100"><BrainCircuit className="text-indigo-600" /></div>
      </div>

      <div className="space-y-8">
        {/* Pilih Mapel */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Mata Pelajaran</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'matematika', label: 'MTK', icon: <Calculator size={20}/> },
              { id: 'ipa', label: 'IPA', icon: <Microscope size={20}/> },
              { id: 'ips', label: 'IPS', icon: <Globe2 size={20}/> }
            ].map(m => (
              <button 
                key={m.id}
                onClick={() => { setSubject(m.id); setGrade(null); }}
                className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${subject === m.id ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg' : 'bg-white border-transparent text-slate-400 shadow-sm'}`}
              >
                {m.icon}
                <span className="text-[10px] font-black">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Pilih Jenjang */}
        <section className="animate-in fade-in duration-500">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Pilih Jenjang</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['sd', 'smp'].map(g => (
              <button 
                key={g}
                onClick={() => setGrade(g)}
                className={`p-6 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all border-4 ${grade === g ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl scale-105' : 'bg-white border-white shadow-sm text-slate-400 hover:border-indigo-100'}`}
              >
                <LayoutGrid size={32} />
                <span className="font-black uppercase">{g}</span>
              </button>
            ))}
          </div>
        </section>

        {grade && (
          <section className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex items-center gap-2 mb-4">
              <Target className="text-slate-400" size={18} />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tingkat</h2>
            </div>
            <div className="space-y-3">
              {['kabupaten', 'provinsi', 'nasional'].map((l) => (
                <button 
                  key={l}
                  onClick={() => startQuiz(grade, l)}
                  className="w-full flex items-center justify-between p-6 bg-white border-2 border-white shadow-sm rounded-[2rem] hover:border-indigo-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600">
                       {l === 'kabupaten' ? <Pi size={20} /> : l === 'provinsi' ? <FunctionSquare size={20} /> : <Trophy size={20} />}
                    </div>
                    <span className="font-black text-slate-700 capitalize">{l}</span>
                  </div>
                  <ChevronRight className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderStatistik = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <h2 className="text-2xl font-black text-slate-800 mb-6 italic text-center">Progres Belajar</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl">
          <p className="text-[10px] font-black opacity-60 uppercase mb-1">Total Poin</p>
          <div className="text-3xl font-black">{stats.totalPoin} XP</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Sesi Selesai</p>
          <div className="text-3xl font-black text-slate-800">{stats.totalSesi}</div>
        </div>
      </div>
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Riwayat Terakhir</h3>
      <div className="space-y-3">
        {stats.history.map((h, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-50 flex justify-between items-center">
            <div>
              <p className="font-black text-slate-700 uppercase text-[10px]">{h.subject} • {h.grade} • {h.level}</p>
              <p className="text-[9px] text-slate-400 font-medium">{h.date}</p>
            </div>
            <span className="text-lg font-black text-indigo-600">+{h.score}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPeringkat = () => (
    <div className="max-w-md mx-auto pt-10 pb-32 px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Daftar Peringkat</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kumpulkan XP dari semua mapel</p>
      </div>
      
      <div className={`w-full p-8 rounded-[3.5rem] ${currentRank.bg} border-4 ${currentRank.border} mb-12 flex flex-col items-center shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">{React.cloneElement(currentRank.icon, { size: 120 })}</div>
        <div className={`${currentRank.color} mb-4 p-4 bg-white rounded-full shadow-sm`}>{React.cloneElement(currentRank.icon, { size: 48 })}</div>
        <h3 className={`text-3xl font-black ${currentRank.color}`}>{currentRank.title}</h3>
        <p className="text-[10px] font-black text-slate-500 uppercase mt-1">Status Kamu Saat Ini</p>
        <div className="w-full mt-8">
           <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2">
              <span>Progres</span>
              <span>{stats.totalPoin} XP</span>
           </div>
           <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: nextRank ? `${(stats.totalPoin / nextRank.min) * 100}%` : '100%' }} />
           </div>
        </div>
      </div>

      <div className="space-y-3">
        {RANKS.map((r) => {
          const isUnlocked = stats.totalPoin >= r.min;
          return (
            <div key={r.id} className={`p-4 rounded-[2rem] flex items-center justify-between border-2 transition-all ${isUnlocked ? 'bg-white border-indigo-50 shadow-sm' : 'bg-slate-50 border-transparent grayscale opacity-40'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.bg} ${r.color}`}>{r.icon}</div>
                <div>
                   <p className="font-black text-slate-700 text-sm">{r.title}</p>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">{r.min} XP</p>
                </div>
              </div>
              {isUnlocked && <CheckCircle2 className="text-indigo-600" size={16} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  if (quizActive) {
    return (
      <div className="min-h-screen bg-white fixed inset-0 z-[100] flex flex-col overflow-hidden">
        <div className="bg-white border-b border-slate-50 px-6 py-4 flex items-center justify-between shadow-sm flex-shrink-0">
          <button onClick={() => setQuizActive(false)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px]"><Home size={18} /> Beranda</button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{subject} • {grade} • {level}</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-4 h-1 rounded-full ${i < Math.floor(currentIndex/5) ? 'bg-indigo-600' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>
          <div className="text-indigo-600 font-black tracking-tighter">Skor: {score}</div>
        </div>

        {!showResult ? (
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soal {currentIndex + 1} / 25</span>
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg uppercase">{questions[currentIndex]?.bidang}</span>
              </div>

              <div className="bg-indigo-900 p-10 rounded-[3.5rem] text-white shadow-2xl mb-8 text-center relative overflow-hidden">
                <div className="relative z-10 text-xl font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pertanyaan} /></div>
              </div>

              <div className="space-y-3">
                {[questions[currentIndex]?.jawabanBenar, ...questions[currentIndex]?.opsiLain].sort().map((opsi, idx) => {
                  const isSelected = selectedAnswer === opsi;
                  const isCorrect = opsi === questions[currentIndex]?.jawabanBenar;
                  let style = "bg-slate-50 border-transparent text-slate-700 hover:bg-slate-100";
                  if (selectedAnswer) {
                    if (isCorrect) style = "bg-emerald-500 border-emerald-300 text-white shadow-lg scale-[1.02]";
                    else if (isSelected) style = "bg-rose-500 border-rose-300 text-white opacity-60";
                    else style = "bg-slate-50 text-slate-300 opacity-40";
                  }
                  return (
                    <button key={idx} disabled={!!selectedAnswer} onClick={() => handleAnswer(opsi)} className={`w-full p-6 rounded-[2.2rem] text-left font-bold border-2 transition-all flex items-center justify-between ${style}`}>
                      <MathText text={opsi} />
                      {selectedAnswer && isCorrect && <CheckCircle2 size={20} />}
                    </button>
                  );
                })}
              </div>

              {showExplanation && (
                <div ref={explanationRef} className="mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
                  <div className="bg-indigo-50 p-8 rounded-[3rem] border-2 border-indigo-100 mb-6">
                    <div className="flex items-center gap-2 mb-3"><Key size={16} className="text-indigo-600" /><h3 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest">Pembahasan</h3></div>
                    <div className="text-indigo-800/80 text-sm font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pembahasan} /></div>
                  </div>
                  <button onClick={() => currentIndex < questions.length - 1 ? (setCurrentIndex(currentIndex + 1), setSelectedAnswer(null), setShowExplanation(false)) : finishQuiz()} className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95">
                    {currentIndex < questions.length - 1 ? 'LANJUT SOAL BERIKUTNYA' : 'LIHAT HASIL AKHIR'} <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-12">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className={`w-32 h-32 ${currentRank.bg} rounded-[3rem] flex items-center justify-center mb-8 shadow-2xl ${currentRank.color}`}>{React.cloneElement(currentRank.icon, { size: 64 })}</div>
              <h2 className="text-4xl font-black text-slate-800 mb-2 italic">Luar Biasa!</h2>
              <div className="bg-slate-50 w-full p-10 rounded-[3.5rem] mb-8 text-center border-2 border-white shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Skor Sesi Ini</span>
                  <div className="text-8xl font-black text-indigo-600 leading-none">{score}</div>
                  <p className="mt-6 text-xs font-bold text-emerald-500 uppercase flex items-center justify-center gap-2"><Flame size={14} /> +{score} XP Berhasil Diraih</p>
              </div>
              <div className="w-full space-y-3 mb-10">
                <button onClick={() => startQuiz(grade, level)} className="w-full py-6 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95"><RefreshCcw size={20} /> ULANGI LAGI</button>
                <button onClick={() => setQuizActive(false)} className="w-full py-6 bg-white text-slate-400 rounded-[2.5rem] font-black border-2 border-slate-100">KEMBALI KE MENU</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="pb-32">{activeTab === 'beranda' && renderBeranda()} {activeTab === 'statistik' && renderStatistik()} {activeTab === 'peringkat' && renderPeringkat()}</div>
      <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6">
        <nav className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-[2.8rem] p-2 flex items-center justify-between w-full max-w-sm">
          {['beranda', 'statistik', 'peringkat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-[2.2rem] transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>
              {tab === 'beranda' ? <Home size={20}/> : tab === 'statistik' ? <BarChart3 size={20}/> : <Award size={20}/>}
              <span className="text-[9px] font-black uppercase">{tab}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}