import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Trophy, HelpCircle, Key, RefreshCcw, CheckCircle2, 
  XCircle, ChevronRight, Target, Award, Home, AlertTriangle,
  BrainCircuit, GraduationCap, ChevronLeft, BarChart3, Star, Zap, ShieldCheck,
  Calculator, Pi, FunctionSquare, LayoutGrid, Gem, Crown, Flame, Microscope, Globe2, BookOpen, Clock, Sparkles
} from 'lucide-react';

const apiKey = ""; 

const SOAL_DATABASE = {
  matematika: {
    sd: {
      kabupaten: [
        { id: 'mtksdk1', bidang: 'Aljabar', pertanyaan: "Jika $3n + 7 = 22$, nilai dari $n - 2$ adalah...", jawabanBenar: "3", opsiLain: ["5", "15", "7"], pembahasan: "$3n = 22 - 7 \\implies 3n = 15 \\implies n = 5$. Maka $n - 2 = 5 - 2 = 3$." },
        { id: 'mtksdk2', bidang: 'Geometri', pertanyaan: "Luas persegi dengan keliling 24 cm adalah...", jawabanBenar: "36", opsiLain: ["24", "48", "144"], pembahasan: "Sisi = $24 / 4 = 6$. Luas = $6 \\times 6 = 36$." },
      ],
      provinsi: [], nasional: []
    },
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  },
  ipa: {
    sd: { kabupaten: [], provinsi: [], nasional: [] },
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  },
  ips: {
    smp: { kabupaten: [], provinsi: [], nasional: [] }
  }
};

const fillTo25 = (pool, subject, grade, level, specificBidang) => {
  if (pool.length >= 25) return pool;
  const needed = 25 - pool.length;
  const mockData = [];
  for (let i = 0; i < needed; i++) {
    const bidangList = ['Aljabar', 'Geometri', 'Teori Bilangan', 'Kombinatorika'];
    const currentBidang = specificBidang || bidangList[i % bidangList.length];
    mockData.push({
      id: `mock-${subject}-${grade}-${level}-${i}`,
      bidang: currentBidang,
      pertanyaan: `[${currentBidang}] Berapa hasil dari $${10 + i} \\times 2 + 5$ ?`,
      jawabanBenar: `${(10 + i) * 2 + 5}`,
      opsiLain: [`${(10 + i) * 2}`, `${(10 + i) * 2 + 10}`, `${(10 + i) * 2 - 5}`],
      pembahasan: "Operasi hitung perkalian didahulukan sebelum penjumlahan."
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
  const [selectedBidang, setSelectedBidang] = useState(null);
  const [isSimulasi, setIsSimulasi] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(150 * 60); 
  
  const explanationRef = useRef(null);

  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('math_olympiad_v5_stats');
    return saved ? JSON.parse(saved) : { totalPoin: 0, totalSesi: 0, history: [], bidangStats: {} };
  });

  useEffect(() => {
    localStorage.setItem('math_olympiad_v5_stats', JSON.stringify(stats));
  }, [stats]);

  const RANKS = [
    { id: 1, title: "Perunggu", min: 0, color: "text-orange-500", bg: "bg-orange-100", border: "border-orange-200", icon: <Award size={32} /> },
    { id: 2, title: "Perak", min: 1000, color: "text-slate-400", bg: "bg-slate-100", border: "border-slate-200", icon: <ShieldCheck size={32} /> },
    { id: 3, title: "Emas", min: 3000, color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-200", icon: <Trophy size={32} /> },
    { id: 4, title: "Diamond", min: 7000, color: "text-cyan-400", bg: "bg-cyan-100", border: "border-cyan-200", icon: <Gem size={32} /> },
    { id: 5, title: "Legend", min: 15000, color: "text-indigo-500", bg: "bg-indigo-100", border: "border-indigo-200", icon: <Crown size={32} /> },
    { id: 6, title: "Mythic", min: 30000, color: "text-rose-500", bg: "bg-rose-100", border: "border-rose-200", icon: <Zap size={32} /> },
  ];

  const currentRank = useMemo(() => {
    return [...RANKS].reverse().find(r => stats.totalPoin >= r.min) || RANKS[0];
  }, [stats.totalPoin]);

  const nextRank = useMemo(() => RANKS.find(r => r.min > stats.totalPoin), [stats.totalPoin]);

  const finishQuiz = () => {
    setStats(prev => ({
      ...prev,
      totalPoin: prev.totalPoin + score,
      totalSesi: prev.totalSesi + 1,
      history: [{ date: new Date().toLocaleDateString(), score, grade, level, bidang: selectedBidang, mode: isSimulasi ? 'Simulasi' : 'Latihan' }, ...prev.history].slice(0, 10)
    }));
    setShowResult(true);
  };

  useEffect(() => {
    let timer;
    if (quizActive && !showResult && isSimulasi && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && quizActive && isSimulasi) {
      finishQuiz();
    }
    return () => clearInterval(timer);
  }, [quizActive, showResult, timeLeft, isSimulasi]);

  useEffect(() => {
    if ((showExplanation || aiExplanation) && explanationRef.current) {
      explanationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showExplanation, aiExplanation]);

  const startQuiz = (g, l, bidang, simulasi) => {
    let pool = SOAL_DATABASE[subject]?.[g]?.[l] || [];
    if (bidang !== 'Campuran') {
      pool = pool.filter(q => q.bidang === bidang);
    }
    const fullPool = fillTo25(pool, subject, g, l, bidang !== 'Campuran' ? bidang : null);
    const shuffled = [...fullPool].sort(() => Math.random() - 0.5).slice(0, 25);
    
    setQuestions(shuffled);
    setGrade(g);
    setLevel(l);
    setSelectedBidang(bidang);
    setIsSimulasi(simulasi);
    setQuizActive(true);
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAiExplanation("");
    setTimeLeft(150 * 60);
  };

  const handleAnswer = (ans) => {
    if (selectedAnswer) return;
    setSelectedAnswer(ans);
    const currentQ = questions[currentIndex];
    const isCorrect = ans === currentQ.jawabanBenar;
    
    if (isCorrect) setScore(s => s + 4);

    setStats(prev => {
      const newBidangStats = { ...prev.bidangStats };
      if (!newBidangStats[currentQ.bidang]) newBidangStats[currentQ.bidang] = { correct: 0, total: 0 };
      newBidangStats[currentQ.bidang].total += 1;
      if (isCorrect) newBidangStats[currentQ.bidang].correct += 1;
      return { ...prev, bidangStats: newBidangStats };
    });
  };

  const fetchAiExplanation = async () => {
    if (loadingAi) return;
    setLoadingAi(true);
    const question = questions[currentIndex];
    const prompt = `Gunakan bahasa Indonesia. Jelaskan secara mendalam dan step-by-step soal olimpiade ini: Pertanyaan: ${question.pertanyaan}. Jawaban benar adalah: ${question.jawabanBenar}. Berikan logika berpikir dan konsep dasarnya agar mudah dipahami.`;
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiExplanation(text || "Gagal memanggil AI.");
    } catch (e) {
      setAiExplanation("Koneksi AI terputus.");
    } finally {
      setLoadingAi(false);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderBeranda = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter italic">OLIMPIA<span className="text-indigo-600">PRO</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium Learning Experience</p>
        </div>
        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100"><BrainCircuit className="text-indigo-600" /></div>
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'matematika', label: 'MTK', icon: <Calculator size={20}/> },
              { id: 'ipa', label: 'IPA', icon: <Microscope size={20}/> },
              { id: 'ips', label: 'IPS', icon: <Globe2 size={20}/> }
            ].map(m => (
              <button key={m.id} onClick={() => { setSubject(m.id); setGrade(null); setLevel(null); }} className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${subject === m.id ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg' : 'bg-white border-transparent text-slate-400 shadow-sm'}`}>
                {m.icon}
                <span className="text-[10px] font-black">{m.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-slate-400" size={18} />
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Jenjang Pendidikan</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['sd', 'smp'].map(g => (
              <button key={g} onClick={() => { setGrade(g); setLevel(null); }} className={`p-6 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all border-4 ${grade === g ? 'bg-indigo-600 border-indigo-200 text-white shadow-xl' : 'bg-white border-white shadow-sm text-slate-400'}`}>
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
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Tingkat Kompetisi</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['kabupaten', 'provinsi', 'nasional'].map((l) => (
                <button key={l} onClick={() => setLevel(l)} className={`p-4 rounded-3xl flex flex-col items-center gap-2 border-2 transition-all ${level === l ? 'bg-indigo-600 border-indigo-200 text-white shadow-lg' : 'bg-white border-transparent text-slate-400 shadow-sm'}`}>
                   <span className="text-[10px] font-black capitalize">{l}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {level && (
          <section className="animate-in slide-in-from-bottom-4 duration-500 pb-10">
             <div className="flex items-center gap-2 mb-4">
              <Star className="text-slate-400" size={18} />
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Bidang & Mode</h2>
            </div>
            <div className="space-y-4">
              {['Campuran', 'Aljabar', 'Geometri', 'Teori Bilangan', 'Kombinatorika'].map((b) => (
                <div key={b} className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-50">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-black text-slate-700">{b}</span>
                    <span className="text-[10px] font-bold text-slate-300 uppercase italic">25 Soal</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => startQuiz(grade, level, b, false)} className="py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-200">
                      <BookOpen size={14}/> Latihan
                    </button>
                    <button onClick={() => startQuiz(grade, level, b, true)} className="py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-100">
                      <Clock size={14}/> Simulasi
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderStatistik = () => (
    <div className="max-w-md mx-auto pt-8 pb-32 px-6">
      <h2 className="text-2xl font-black text-slate-800 mb-6 italic text-center">Profil Kemajuan</h2>
      
      {/* Poin & Sesi */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] text-white shadow-xl">
          <p className="text-[10px] font-black opacity-60 uppercase mb-1">Total Poin</p>
          <div className="text-3xl font-black">{stats.totalPoin} XP</div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Sesi</p>
          <div className="text-3xl font-black text-slate-800">{stats.totalSesi}</div>
        </div>
      </div>

      {/* Analisis Bidang */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Analisis Bidang</h3>
          <BarChart3 size={16} className="text-slate-300" />
        </div>
        <div className="space-y-4">
          {Object.entries(stats.bidangStats).length > 0 ? Object.entries(stats.bidangStats).map(([bidang, data]) => {
            const ratio = (data.correct / data.total) * 100;
            const isWeak = ratio < 60;
            return (
              <div key={bidang} className="group transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {isWeak ? <AlertTriangle size={18} className="text-rose-500 animate-pulse" /> : <ShieldCheck size={18} className="text-emerald-500" />}
                    <span className="text-sm font-black text-slate-700">{bidang}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${isWeak ? 'text-rose-500' : 'text-emerald-500'}`}>{Math.round(ratio)}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${isWeak ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${ratio}%` }} />
                </div>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-tight">
                  {isWeak ? '⚠️ Perlu Penguatan Materi' : '✨ Penguasaan Sangat Baik'}
                </p>
              </div>
            );
          }) : <p className="text-center text-slate-400 text-xs py-10 italic">Kerjakan soal untuk melihat analisis.</p>}
        </div>
      </div>

      {/* Riwayat */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Riwayat Terakhir</h3>
        {stats.history.length > 0 ? stats.history.map((h, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-50 flex items-center justify-between shadow-sm">
             <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${h.mode === 'Simulasi' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-500'}`}>
                 {h.mode === 'Simulasi' ? <Clock size={18}/> : <BookOpen size={18}/>}
               </div>
               <div>
                 <p className="text-sm font-black text-slate-700">{h.bidang}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase">{h.date} • {h.level}</p>
               </div>
             </div>
             <div className="text-right">
               <p className="text-lg font-black text-indigo-600">{h.score}</p>
               <p className="text-[9px] font-bold text-slate-300 uppercase">XP</p>
             </div>
          </div>
        )) : <p className="text-center text-slate-400 text-xs py-4 italic">Belum ada riwayat.</p>}
      </div>
    </div>
  );

  const renderPeringkat = () => (
    <div className="max-w-md mx-auto pt-10 pb-32 px-6">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black text-slate-800 mb-2 italic">Daftar Peringkat</h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lampaui batas untuk jadi yang terbaik</p>
      </div>
      
      <div className={`w-full p-8 rounded-[3.5rem] ${currentRank.bg} border-4 ${currentRank.border} mb-12 flex flex-col items-center shadow-xl relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-4 opacity-5">{React.cloneElement(currentRank.icon, { size: 120 })}</div>
        <div className={`${currentRank.color} mb-4 p-5 bg-white rounded-[2rem] shadow-sm`}>{React.cloneElement(currentRank.icon, { size: 48 })}</div>
        <h3 className={`text-3xl font-black ${currentRank.color} mb-2`}>{currentRank.title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase mb-8">Peringkat Kamu Saat Ini</p>
        
        <div className="w-full">
           <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3">
              <span>Progres Rank</span>
              <span>{stats.totalPoin} / {nextRank ? nextRank.min : 'MAX'} XP</span>
           </div>
           <div className="w-full h-4 bg-white/50 rounded-full overflow-hidden p-1">
              <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: nextRank ? `${(stats.totalPoin / nextRank.min) * 100}%` : '100%' }} />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {RANKS.map((r) => {
          const isUnlocked = stats.totalPoin >= r.min;
          const isCurrent = currentRank.id === r.id;
          return (
            <div key={r.id} className={`p-5 rounded-[2.5rem] flex items-center justify-between border-2 transition-all ${isUnlocked ? (isCurrent ? 'bg-white border-indigo-500 shadow-md ring-4 ring-indigo-50' : 'bg-white border-white shadow-sm') : 'bg-slate-100 border-transparent grayscale opacity-50'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.bg} ${r.color}`}>
                  {React.cloneElement(r.icon, { size: 24 })}
                </div>
                <div>
                   <p className="font-black text-slate-700 text-sm">{r.title}</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.min} XP</p>
                </div>
              </div>
              {isUnlocked ? (
                <CheckCircle2 className="text-emerald-500" size={20} />
              ) : (
                <ShieldCheck className="text-slate-300" size={20} />
              )}
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
          <button onClick={() => setQuizActive(false)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px]"><Home size={18} /> Menu Utama</button>
          {isSimulasi && (
            <div className="flex items-center gap-2 bg-rose-50 px-4 py-1.5 rounded-full text-rose-600 border border-rose-100">
               <Clock size={14} className="animate-pulse" />
               <span className="text-xs font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
          )}
          {!isSimulasi && <div className="text-[10px] font-black text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full uppercase">Mode Latihan</div>}
          <div className="text-indigo-600 font-black tracking-tighter">Skor: {score}</div>
        </div>

        {!showResult ? (
          <div className="flex-1 overflow-y-auto px-6 py-8 pb-32">
            <div className="max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pertanyaan {currentIndex + 1} / 25</span>
                 <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-wider">{questions[currentIndex]?.bidang}</span>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl mb-10 text-center relative overflow-hidden min-h-[180px] flex items-center justify-center">
                <div className="relative z-10 text-xl font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pertanyaan} /></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/30" style={{ width: `${((currentIndex + 1) / 25) * 100}%` }} />
              </div>

              <div className="space-y-4">
                {[questions[currentIndex]?.jawabanBenar, ...questions[currentIndex]?.opsiLain].sort().map((opsi, idx) => {
                  const isSelected = selectedAnswer === opsi;
                  const isCorrect = opsi === questions[currentIndex]?.jawabanBenar;
                  let style = "bg-slate-50 border-transparent text-slate-700 active:scale-95";
                  if (selectedAnswer) {
                    if (isCorrect) style = "bg-emerald-500 border-emerald-300 text-white shadow-lg scale-[1.02]";
                    else if (isSelected) style = "bg-rose-500 border-rose-300 text-white opacity-60";
                    else style = "bg-slate-50 text-slate-300 opacity-40";
                  }
                  return (
                    <button key={idx} disabled={!!selectedAnswer} onClick={() => handleAnswer(opsi)} className={`w-full p-6 rounded-[2.2rem] text-left font-bold border-2 transition-all flex items-center justify-between ${style}`}>
                      <MathText text={opsi} />
                      {selectedAnswer && isCorrect && <CheckCircle2 size={22} />}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <div ref={explanationRef} className="mt-10 space-y-6 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="flex items-center gap-3">
                    {/* Tombol AI (Bulat Kecil) */}
                    <button onClick={fetchAiExplanation} className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0">
                      {loadingAi ? <RefreshCcw size={22} className="animate-spin" /> : <Sparkles size={22} />}
                    </button>
                    
                    {/* Tombol Kunci */}
                    <button onClick={() => setShowExplanation(!showExplanation)} className={`flex-1 py-5 rounded-[2.2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all ${showExplanation ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-indigo-100 text-indigo-600'}`}>
                      <Key size={18} /> Kunci
                    </button>
                    
                    {/* Tombol Next */}
                    <button onClick={() => currentIndex < questions.length - 1 ? (setCurrentIndex(currentIndex + 1), setSelectedAnswer(null), setShowExplanation(false), setAiExplanation("")) : finishQuiz()} className="flex-1 py-5 bg-slate-900 text-white rounded-[2.2rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95">
                      Lanjut <ChevronRight size={18} />
                    </button>
                  </div>

                  {showExplanation && (
                    <div className="bg-indigo-50 p-8 rounded-[3rem] border-2 border-indigo-100 animate-in fade-in zoom-in-95">
                       <h3 className="font-black text-indigo-900 text-[10px] uppercase tracking-widest mb-3">Langkah Penyelesaian</h3>
                       <div className="text-indigo-800 text-sm font-medium leading-relaxed"><MathText text={questions[currentIndex]?.pembahasan} /></div>
                    </div>
                  )}

                  {aiExplanation && (
                    <div className="bg-amber-50 p-8 rounded-[3rem] border-2 border-amber-100 animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-amber-600" />
                        <h3 className="font-black text-amber-900 text-[10px] uppercase tracking-widest">Analisis Puter.js</h3>
                      </div>
                      <div className="text-amber-800 text-sm font-medium whitespace-pre-wrap leading-relaxed italic">{aiExplanation}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center justify-center">
            <div className={`w-36 h-36 ${currentRank.bg} rounded-[3rem] flex items-center justify-center mb-10 shadow-2xl ${currentRank.color} animate-bounce`}>{React.cloneElement(currentRank.icon, { size: 72 })}</div>
            <h2 className="text-4xl font-black text-slate-800 mb-2 italic">Luar Biasa!</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-12">Sesi Berakhir</p>
            
            <div className="bg-slate-50 w-full max-w-sm p-12 rounded-[4rem] mb-12 text-center border-2 border-white shadow-sm relative">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Total XP Diraih</span>
                <div className="text-9xl font-black text-indigo-600 leading-none">{score}</div>
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white w-14 h-14 rounded-full flex items-center justify-center font-black shadow-lg">+{score}</div>
            </div>
            
            <button onClick={() => setQuizActive(false)} className="w-full max-w-sm py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:scale-105 active:scale-95 transition-all">SELESAI</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <div className="pb-32 animate-in fade-in duration-700">
        {activeTab === 'beranda' && renderBeranda()} 
        {activeTab === 'statistik' && renderStatistik()} 
        {activeTab === 'peringkat' && renderPeringkat()}
      </div>
      
      <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-6">
        <nav className="bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[3rem] p-2.5 flex items-center justify-between w-full max-w-md">
          {['beranda', 'statistik', 'peringkat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex flex-col items-center gap-1.5 py-4 rounded-[2.5rem] transition-all duration-300 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-indigo-400'}`}>
              {tab === 'beranda' ? <Home size={22}/> : tab === 'statistik' ? <BarChart3 size={22}/> : <Trophy size={22}/>}
              <span className="text-[10px] font-black uppercase tracking-wider">{tab}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
