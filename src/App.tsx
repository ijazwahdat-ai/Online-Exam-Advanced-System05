import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, AlertCircle, GraduationCap, ArrowLeft, Send, ShieldCheck, UserCheck, Lock, Bot } from 'lucide-react';
import { cn, toEnglishNumbers } from './lib/utils';
import { EXAM_QUESTIONS } from './lib/questions';

// --- Types ---

interface StudentInfo {
  name: string;
  fatherName: string;
  province: string;
  studentId: string;
}

type ExamState = 'registration' | 'intro' | 'exam' | 'results' | 'admin-login' | 'admin-dash';

// --- AIAssistantBot Component ---
const AIAssistantBot = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const messages = [
    "⭐️ به آکادمی ستاره‌های درخشان و WBT خوش آمدید. پیشرو در آموزش دیجیتال.",
    "💼 در آکادمی ستاره‌های درخشان درس بخوانید تا پس از فراغت، در پروژه‌های آنلاین صاحب وظیفه شوید.",
    "📚 ثبت‌نام دوره‌های جدید آغاز شد: انگلیسی، عربی، تفسیر و ترجمه قرآن کریم. همین حالا اقدام کنید!",
    "🤖 من دستیار هوشمند استاد شما هستم. سیستم نظارت بر اساس تحلیل احساسات و رفتار فعال است.",
    "⚠️ هشدار: لطفاً از نقل کردن (تقلب) خودداری کنید. من تمام فعالیت‌های شما را به استاد گزارش می‌دهم.",
    "📉 توجه: هرگونه تلاش برای تقلب شناسایی شده و سیستم به صورت خودکار از نمره نهایی شما کسر خواهد کرد."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
      // Change message only when becoming visible
      if (!isVisible) {
        setMsgIndex(prev => (prev + 1) % messages.length);
      }
    }, 5000); // 5 seconds toggle

    return () => clearInterval(interval);
  }, [isVisible, messages.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          className="fixed bottom-24 right-4 md:right-8 z-50 max-w-[280px] md:max-w-xs"
        >
          <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex gap-4">
            <div className="shrink-0">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce duration-[3000ms]">
                <Bot className="h-7 w-7 text-slate-900" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">WBT AI Assistant</span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {messages[msgIndex]}
              </p>
            </div>
          </div>
          {/* Talk bubble pointer-like effect */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900 border-r border-b border-amber-500/30 rotate-45"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const [examState, setExamState] = useState<ExamState>('registration');
  const [studentInfo, setStudentInfo] = useState<StudentInfo>({
    name: '',
    fatherName: '',
    province: '',
    studentId: ''
  });

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);

  // Admin state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminResults, setAdminResults] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  // ID Validation Function (Ps01 to Ps50)
  const isValidStudentId = (id: string) => {
    // English 'Ps' or 'pS', 'ps', 'PS' followed by 01 through 50
    const match = id.match(/^ps(?:0[1-9]|[1-4][0-9]|50)$/i);
    return !!match;
  };

  useEffect(() => {
    if (examState !== 'exam') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, currentQIndex]);

  const handleStartExam = () => {
    const engId = toEnglishNumbers(studentInfo.studentId.trim());

    if (!studentInfo.name || !studentInfo.fatherName || !studentInfo.province || !engId) {
      alert("لطفاً مشخصات خود (نام، نام پدر، ولایت و آیدی محصل) را به گونه دقیق و کامل وارد نمایید.");
      return;
    }

    if (!isValidStudentId(engId)) {
      alert("آیدی محصل نامعتبر است! آیدی باید فقط از Ps01 تا Ps50 باشد. (مثال: Ps01)");
      return;
    }

    setStudentInfo(prev => ({...prev, studentId: engId}));
    setExamState('intro');
  };

  const beginTest = () => {
    setExamState('exam');
    setCurrentQIndex(0);
    setAnswers({});
    setTimeLeft(EXAM_QUESTIONS[0]?.timeLimit || 45);
  };

  const handleSelectAnswer = (ans: string) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: ans }));
  };

  const handleNextQuestion = () => {
    if (currentQIndex < EXAM_QUESTIONS.length - 1) {
      const nextIndex = currentQIndex + 1;
      setCurrentQIndex(nextIndex);
      setTimeLeft(EXAM_QUESTIONS[nextIndex].timeLimit || 45);
    } else {
      finishExam();
    }
  };

  const finishExam = async () => {
    let correctCount = 0;
    EXAM_QUESTIONS.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        correctCount++;
      }
    });

    // 2 points per correct answer
    const finalScore = correctCount * 2;
    setScore(finalScore);
    setExamState('results');

    // Save result to backend automatically
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentInfo,
          score: finalScore,
          totalPossible: EXAM_QUESTIONS.length * 2,
          completedAt: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Failed to save result to backend", err);
    }
  };

  const handleAdminLogin = async () => {
    setIsAdminLoading(true);
    setAdminError('');
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password: adminPassword })
      });
      const data = await res.json();

      if (res.ok) {
        setAdminResults(data.reverse()); // latest first
        setExamState('admin-dash');
      } else {
        setAdminError(data.error || "کد اشتباه است");
      }
    } catch (err) {
      setAdminError("خطا در ارتباط با سرور");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const handleAdminRefresh = async () => {
     handleAdminLogin();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toEnglishNumbers(mins.toString().padStart(2, '0'))}:${toEnglishNumbers(secs.toString().padStart(2, '0'))}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Auto-convert standard inputs partially, but allow letters for ID (like Ps01)
    let finalValue = value;
    if (name === 'studentId') {
      finalValue = toEnglishNumbers(value);
    }
    setStudentInfo(prev => ({ ...prev, [name]: finalValue }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col" dir="rtl">

      {/* AI Assistant Bot */}
      <AIAssistantBot />

      {/* Header bar */}
      <header className="flex justify-between items-center border-b border-slate-700/80 shadow-sm pb-6 mb-8 pt-6 px-8 bg-[#0f172a] w-full relative z-10">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50">
              <GraduationCap className="h-6 w-6 text-[#0f172a]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-white to-slate-400">آکادمی ستاره‌های درخشان کامپیوتر ساینس و زبان‌ها</h1>
              <p className="text-slate-400 text-xs md:text-sm tracking-wide mt-1">امتحان اول روانشناسی</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Connection Secure</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto px-4 pb-12 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* REGISTRATION */}
          {examState === 'registration' && (
            <motion.div 
              key="registration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-2xl shadow-black/50"
            >
              <div className="pb-6 border-b border-slate-700 text-center mb-8 relative">
                <BookOpen className="h-14 w-14 mx-auto mb-4 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                <h2 className="text-3xl font-bold mb-3 text-white">پورتال ورود به امتحان</h2>
                <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">لطفاً برای شرکت در امتحان آنلاین، مشخصات دقیق خود را وارد نمایید. تطابق اطلاعات الزامی است.</p>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative group">
                    <label className="text-sm font-semibold text-slate-300">نام (الزامی)</label>
                    <input 
                      name="name" 
                      value={studentInfo.name} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-slate-900 text-white transition-all shadow-inner"
                      placeholder="نام محصل..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">نام پدر (الزامی)</label>
                    <input 
                      name="fatherName" 
                      value={studentInfo.fatherName} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-slate-900 text-white transition-all shadow-inner"
                      placeholder="نام پدر..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">ولایت (الزامی)</label>
                    <input 
                      name="province" 
                      value={studentInfo.province} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-slate-900 text-white transition-all shadow-inner"
                      placeholder="ولایت مربوطه..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">آیدی اختصاصی מחصل (الزامی)</label>
                    <input 
                      name="studentId" 
                      value={studentInfo.studentId} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-slate-900 text-white transition-all shadow-inner font-mono tracking-widest text-left"
                      placeholder="e.g. Ps01"
                      dir="ltr"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center justify-end gap-1">
                      (آیدی باید دقیقاً مطابق لیست توزیع شده باشد)
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={handleStartExam}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3 text-lg"
                  >
                    تایید هویت و ورود به سیستم
                    <UserCheck className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* INTRO */}
          {examState === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col relative overflow-hidden text-center shadow-2xl"
            >
              <AlertCircle className="h-16 w-16 mx-auto mb-6 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
              <h2 className="text-3xl font-bold text-white mb-4">رهنمای امتحان آنلاین</h2>
              <ul className="text-right text-slate-300 space-y-4 mb-8 bg-slate-900/50 p-6 rounded-xl border border-slate-700/80 shadow-inner">
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold mt-1 shadow-amber-500">❖</span>
                  <span>این امتحان شامل <strong className="text-amber-400">{toEnglishNumbers("50")} سوال</strong> تستی (صحیح/غلط و چهار جوابه) از منابع مشخص شده می‌باشد.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold mt-1 shadow-amber-500">❖</span>
                  <span>ارزش هر سوال <strong className="text-amber-400">۲ نمره</strong> بوده و مجموع نمرات <strong className="text-amber-400">۱۰۰ نمره</strong> محاسبه می‌گردد.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold mt-1 shadow-amber-500">❖</span>
                  <span>زمان پاسخگویی به هر سوال متناسب با دشواری آن بین <strong className="text-amber-400">۳۰ الی ۴۵ ثانیه</strong> تنظیم شده است.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold mt-1">❖</span>
                  <span>زمان هر سوال مجزا بوده و در صورت اتمام زمان، سیستم به طور خودکار به سوال بعدی عبور می‌کند. بازگشت به عقب <strong>مطلقاً ناممکن</strong> است.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-500 font-bold mt-1">❖</span>
                  <span>سیستم نمره نهایی را پس از پایان سوال آخر فوراً محاسبه و ذخیره می‌کند.</span>
                </li>
              </ul>
              <button 
                onClick={beginTest}
                className="w-full sm:w-auto px-16 bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] inline-block text-lg"
              >
                شروع امتحان
              </button>
            </motion.div>
          )}

          {/* EXAM */}
          {examState === 'exam' && EXAM_QUESTIONS.length > 0 && (
            <motion.div 
              key={`question-${currentQIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col relative w-full shadow-2xl"
            >
              <div className="absolute top-0 right-0 bg-amber-500 text-slate-900 px-6 py-1.5 rounded-bl-[1.5rem] font-bold text-sm md:text-base z-10 shadow-lg">
                سوال {toEnglishNumbers((currentQIndex + 1).toString())} از {toEnglishNumbers("50")}
              </div>
              
              <div className="mt-6 mb-8 border-b border-slate-700 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h3 className="text-xl md:text-2xl font-medium leading-loose text-white pt-2 pr-2">
                  {EXAM_QUESTIONS[currentQIndex]?.text || "بدون متن (سوال نمونه)"}
                </h3>
                
                <div className="bg-slate-900 border border-slate-700 shadow-xl rounded-xl px-6 py-3 flex flex-col items-center min-w-32 shrink-0 self-start md:self-auto ring-1 ring-slate-800">
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-400 mb-1">زمان باقیمانده</span>
                  <span className={cn(
                    "text-3xl font-mono font-bold tracking-wider",
                    timeLeft <= 10 ? "text-red-400 animate-pulse drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" : "text-amber-400"
                  )}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 flex-1">
                {EXAM_QUESTIONS[currentQIndex]?.options.map((option, i) => {
                  const isSelected = answers[currentQIndex] === option;
                  const letters = EXAM_QUESTIONS[currentQIndex].type === 'true-false' ? ["•", "•"] : ["الف", "ب", "ج", "د", "هـ"];
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(option)}
                      className={cn(
                        "w-full text-right p-5 rounded-xl border transition-all duration-200 flex items-center gap-5 group",
                        isSelected 
                          ? "border-amber-500 bg-gradient-to-l from-amber-500/10 to-transparent text-white font-semibold ring-1 ring-amber-500/50 shadow-inner" 
                          : "border-slate-700 bg-slate-900/50 hover:bg-slate-700 hover:border-slate-500 text-slate-300"
                      )}
                    >
                      <span className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center border transition-all shrink-0 text-lg shadow-sm",
                        isSelected 
                          ? "bg-amber-500 border-amber-400 text-slate-900 font-bold" 
                          : "bg-slate-800 border-slate-600 group-hover:border-slate-400 text-slate-400 group-hover:text-amber-400"
                      )}>
                        {letters[i] || "•"}
                      </span>
                      <span className="text-base md:text-lg leading-relaxed">{option}</span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-10 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row justify-between items-center bg-slate-900/30 p-4 rounded-xl">
                <div className="flex items-center gap-3 text-slate-400 text-sm mb-4 sm:mb-0">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                  <span>ذخیره خودکار پاسخ‌ها فعال است...</span>
                </div>
                <button 
                  onClick={handleNextQuestion}
                  className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center gap-3 shadow-lg shadow-white/5"
                >
                  ثبت قطعی و سوال بعدی
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {examState === 'results' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <GraduationCap className="h-64 w-64" />
              </div>

              <div className="relative z-10 mb-10">
                <div className="inline-flex items-center justify-center h-28 w-28 rounded-full bg-slate-900 border-2 border-emerald-500/30 mb-6 font-mono shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                  <span className="text-5xl font-bold text-emerald-400">{toEnglishNumbers(score.toString())}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">امتحان با موفقیت پایان یافت!</h2>
                <p className="text-slate-400 text-lg">خسته نباشید محصل گرامی، <strong className="text-amber-400">{studentInfo.name}</strong></p>
              </div>

              <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-6 md:p-8 text-right mb-8 shadow-inner relative z-10">
                <h3 className="text-white font-bold mb-5 flex items-center gap-2 text-lg">
                  <Send className="h-6 w-6 text-amber-500" />
                  قدم نهایی (الزامی):
                </h3>
                <p className="text-slate-300 leading-relaxed mb-6 font-medium bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
                  لطفاً همین الان از این صفحه یک <strong>اسکرین شات</strong> (عکسی که مشخصات و نمره در آن واضح باشد) بگیرید و از طریق پیام‌رسان واتساپ منحصراً برای استاد خویش ارسال نمایید.
                </p>
                
                <div className="bg-slate-800/80 p-6 rounded-xl font-mono text-sm md:text-base text-slate-300 border border-slate-600 grid gap-3 shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <strong className="text-slate-500">نام مجری:</strong> 
                    <span>{studentInfo.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <strong className="text-slate-500">نام پدر:</strong> 
                    <span>{studentInfo.fatherName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <strong className="text-slate-500">ولایت:</strong> 
                    <span>{studentInfo.province}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2 bg-slate-900/50 -mx-2 px-2 rounded">
                    <strong className="text-slate-500">آیدی محصل:</strong> 
                    <span className="text-amber-400 font-bold tracking-wider">{studentInfo.studentId}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 text-lg">
                    <strong className="text-emerald-500 font-bold">نمره نهایی بدست آمده:</strong> 
                    <span className="text-emerald-400 font-bold">{toEnglishNumbers(score.toString())} / {toEnglishNumbers("100")}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg"
                >
                  خروج از سیستم
                </button>
              </div>
            </motion.div>
          )}

          {/* ADMIN LOGIN */}
          {examState === 'admin-login' && (
            <motion.div 
              key="admin-login"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto relative overflow-hidden shadow-2xl"
            >
              <div className="bg-amber-500/10 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/10">
                <ShieldCheck className="h-10 w-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">پورتال اساتید / مدیریت</h2>
              <p className="text-slate-400 text-sm mb-8">لطفاً اطلاعات کاربری خود را وارد نمایید</p>
              
              <div className="space-y-4">
                <input 
                  type="text"
                  value={adminUsername}
                  onChange={e => setAdminUsername(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-slate-900 text-white text-center text-lg tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                  placeholder="نام کاربری (مثال: admin)"
                  dir="ltr"
                />
                
                <input 
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 bg-slate-900 text-white text-center font-mono text-lg tracking-widest placeholder:tracking-normal placeholder:text-slate-600"
                  placeholder="رمز عبور"
                  dir="ltr"
                />
                
                {adminError && <p className="text-red-400 text-sm font-medium animate-pulse pb-2 mt-2">{adminError}</p>}
                
                <button 
                  onClick={handleAdminLogin}
                  disabled={isAdminLoading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4 text-lg"
                >
                  {isAdminLoading ? 'در حال بررسی...' : 'ورود به پنل مدیریت'}
                </button>
                
                <button 
                  onClick={() => setExamState('registration')}
                  className="text-slate-500 hover:text-white text-sm mt-6 transition-colors underline underline-offset-4"
                >
                  بازگشت به صفحه اصلی
                </button>
              </div>
            </motion.div>
          )}

          {/* ADMIN DASHBOARD */}
          {examState === 'admin-dash' && (
            <motion.div 
              key="admin-dash"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="text-emerald-500" />
                  داشبورد نتایج
                </h2>
                <div className="flex gap-3">
                  <button onClick={handleAdminRefresh} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-colors">
                    بروزرسانی
                  </button>
                  <button onClick={() => setExamState('registration')} className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm transition-colors">
                    خروج
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">ردیف</th>
                      <th className="px-4 py-3 font-medium">نام دانشجو</th>
                      <th className="px-4 py-3 font-medium">نام پدر</th>
                      <th className="px-4 py-3 font-medium">آیدی محصل</th>
                      <th className="px-4 py-3 font-medium">نمره کسب شده</th>
                      <th className="px-4 py-3 font-medium text-left">زمان اتمام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 bg-slate-800/50">
                    {adminResults.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500">هیچ نتیجه‌ای هنوز ثبت نشده است.</td>
                      </tr>
                    ) : (
                      adminResults.map((result, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-4 py-3 text-slate-500 font-mono">{toEnglishNumbers((idx + 1).toString())}</td>
                          <td className="px-4 py-3 font-medium text-slate-200">{result.studentInfo?.name}</td>
                          <td className="px-4 py-3 text-slate-400">{result.studentInfo?.fatherName}</td>
                          <td className="px-4 py-3 text-amber-400 font-mono">{result.studentInfo?.studentId}</td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-1 rounded font-bold font-mono",
                              result.score >= 50 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                            )}>
                              {toEnglishNumbers(result.score?.toString() || "0")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-left font-mono text-xs">
                            {new Date(result.completedAt).toLocaleString('fa-IR', { hour: '2-digit', minute:'2-digit', year:'numeric', month:'2-digit', day:'2-digit' })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] relative z-10 w-full py-5 md:py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-2 text-slate-400 text-xs md:text-sm text-center md:text-right">
            <span>© {toEnglishNumbers("2026")} تمامی حقوق برای اکادمی ستاره های درخشان محفوظ است.</span>
            <span className="hidden md:inline text-slate-600">|</span>
            <button 
              onClick={() => setExamState('admin-login')} 
              className="text-emerald-500/80 hover:text-emerald-400 transition-colors focus:outline-none flex items-center gap-1.5 mt-2 md:mt-0 font-medium"
            >
              <Lock className="h-3 w-3" />
              ورود اساتید / مدیریت
            </button>
          </div>
          
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <span className="text-[10px] uppercase tracking-widest text-slate-600 mb-1">توسعه شده و مدیریت شده توسط</span>
            <div className="flex items-center gap-2 group cursor-pointer transition-all">
              <ShieldCheck className="h-4 w-4 text-slate-600 group-hover:text-amber-500 transition-colors" />
              <strong className="text-slate-300 font-mono tracking-wider font-semibold group-hover:text-amber-400 transition-colors">Wahdat Brain Technology</strong>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

