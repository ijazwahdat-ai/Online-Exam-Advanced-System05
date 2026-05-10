'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, AlertCircle, GraduationCap, ArrowLeft, Send, ShieldCheck, UserCheck, Lock, Bot } from 'lucide-react';
import { cn, toEnglishNumbers } from '../lib/utils';
import { EXAM_QUESTIONS } from '../lib/questions';

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
      if (!isVisible) {
        setMsgIndex(prev => (prev + 1) % messages.length);
      }
    }, 5000);

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
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900 border-r border-b border-amber-500/30 rotate-45"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function ExamPage() {
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

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminResults, setAdminResults] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const isValidStudentId = (id: string) => {
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

    const finalScore = correctCount * 2;
    setScore(finalScore);
    setExamState('results');

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentInfo, score: finalScore })
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
        setAdminResults(data);
        setExamState('admin-dash');
      } else {
        setAdminError(data.error || "نام کاربری یا رمز عبور اشتباه است.");
      }
    } catch (err) {
      setAdminError("خطا در ارتباط با دیتابیس.");
    } finally {
      setIsAdminLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toEnglishNumbers(mins.toString().padStart(2, '0'))}:${toEnglishNumbers(secs.toString().padStart(2, '0'))}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'studentId') {
      finalValue = toEnglishNumbers(value);
    }
    setStudentInfo(prev => ({ ...prev, [name]: finalValue }));
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans flex flex-col" dir="rtl">

      <AIAssistantBot />

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

          {examState === 'registration' && (
            <motion.div key="registration" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
              <div className="pb-6 border-b border-slate-700 text-center mb-8 relative">
                <BookOpen className="h-14 w-14 mx-auto mb-4 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
                <h2 className="text-3xl font-bold mb-3 text-white">پورتال ورود به امتحان</h2>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">نام (الزامی)</label>
                    <input name="name" value={studentInfo.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white" placeholder="نام محصل..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">نام پدر (الزامی)</label>
                    <input name="fatherName" value={studentInfo.fatherName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white" placeholder="نام پدر..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">ولایت (الزامی)</label>
                    <input name="province" value={studentInfo.province} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white" placeholder="ولایت مربوطه..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300">آیدی اختصاصی محصل (الزامی)</label>
                    <input name="studentId" value={studentInfo.studentId} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-900 text-white font-mono tracking-widest text-left" placeholder="e.g. Ps01" dir="ltr" />
                  </div>
                </div>
                <button onClick={handleStartExam} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-900 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg">
                  تایید هویت و ورود به سیستم
                  <UserCheck className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}

          {examState === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
              <AlertCircle className="h-16 w-16 mx-auto mb-6 text-amber-500" />
              <h2 className="text-3xl font-bold text-white mb-4">رهنمای امتحان آنلاین</h2>
              <p className="text-slate-300 mb-8">امتحان شامل ۵۰ سوال و ۱۰۰ نمره می‌باشد. زمان هر سوال محدود است.</p>
              <button onClick={beginTest} className="px-16 bg-white text-slate-900 font-bold py-4 rounded-xl text-lg">شروع امتحان</button>
            </motion.div>
          )}

          {examState === 'exam' && EXAM_QUESTIONS.length > 0 && (
            <motion.div key={`question-${currentQIndex}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <h3 className="text-xl md:text-2xl font-medium text-white">{EXAM_QUESTIONS[currentQIndex]?.text}</h3>
                <div className="bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl flex flex-col items-center">
                  <span className="text-[10px] text-slate-400">زمان</span>
                  <span className={cn("text-2xl font-mono font-bold", timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-amber-400")}>{formatTime(timeLeft)}</span>
                </div>
              </div>
              <div className="grid gap-4">
                {EXAM_QUESTIONS[currentQIndex]?.options.map((option, i) => (
                  <button key={i} onClick={() => handleSelectAnswer(option)} className={cn("w-full text-right p-5 rounded-xl border transition-all", answers[currentQIndex] === option ? "border-amber-500 bg-amber-500/10 text-white" : "border-slate-700 bg-slate-900/50 text-slate-300")}>
                    {option}
                  </button>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                <button onClick={handleNextQuestion} className="bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold flex items-center gap-3">ثبت و بعدی <ArrowLeft className="h-5 w-5" /></button>
              </div>
            </motion.div>
          )}

          {examState === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center shadow-2xl">
              <div className="inline-flex items-center justify-center h-28 w-28 rounded-full bg-slate-900 border-2 border-emerald-500 mb-6">
                <span className="text-5xl font-bold text-emerald-400">{toEnglishNumbers(score.toString())}</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">امتحان پایان یافت!</h2>
              <div className="bg-slate-900 p-6 rounded-xl text-right mb-8">
                <p className="text-slate-300">نام: {studentInfo.name}</p>
                <p className="text-slate-300">نمره: {toEnglishNumbers(score.toString())} / ۱۰۰</p>
                <p className="text-amber-400 mt-4 text-sm font-bold">لطفاً از این صفحه عکس بگیرید.</p>
              </div>
              <button onClick={() => window.location.reload()} className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold">خروج</button>
            </motion.div>
          )}

          {examState === 'admin-login' && (
            <motion.div key="admin-login" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">پنل مدیریت</h2>
              <div className="space-y-4">
                <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-center" placeholder="نام کاربری" dir="ltr" />
                <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-center" placeholder="رمز عبور" dir="ltr" />
                {adminError && <p className="text-red-400 text-sm">{adminError}</p>}
                <button onClick={handleAdminLogin} disabled={isAdminLoading} className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-xl">ورود به پنل</button>
                <button onClick={() => setExamState('registration')} className="text-slate-500 text-sm underline">بازگشت</button>
              </div>
            </motion.div>
          )}

          {examState === 'admin-dash' && (
            <motion.div key="admin-dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full shadow-2xl">
              <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
                <h2 className="text-2xl font-bold text-white">لیست نتایج امتحانات</h2>
                <button onClick={() => setExamState('registration')} className="text-red-400 font-bold px-4 py-2 border border-red-400/30 rounded-lg hover:bg-red-400/10">خروج</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-900 text-slate-300">
                    <tr>
                      <th className="px-4 py-4 border-b border-slate-700">نام محصل</th>
                      <th className="px-4 py-4 border-b border-slate-700">نام پدر</th>
                      <th className="px-4 py-4 border-b border-slate-700">ولایت</th>
                      <th className="px-4 py-4 border-b border-slate-700">آیدی</th>
                      <th className="px-4 py-4 border-b border-slate-700 font-bold">نمره</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {adminResults.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500">هیچ نتیجه‌ای یافت نشد. (لطفاً دیتابیس را در ویرسل وصل کنید)</td>
                      </tr>
                    ) : (
                      adminResults.map((result, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-bold text-white">{result.name}</td>
                          <td className="px-4 py-4 text-slate-300">{result.fatherName}</td>
                          <td className="px-4 py-4 text-slate-300">{result.province}</td>
                          <td className="px-4 py-4 text-amber-500 font-mono tracking-wider">{result.studentId}</td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg font-bold text-base">
                              {toEnglishNumbers(result.score?.toString() || "0")}
                            </span>
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

      <footer className="mt-auto border-t border-slate-800 bg-[#070b14] py-8">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <p className="text-slate-400 text-xs text-center md:text-right">© {toEnglishNumbers("2026")} اکادمی ستاره های درخشان. </p>
          <button onClick={() => setExamState('admin-login')} className="text-emerald-500 text-sm flex items-center gap-1">
            <Lock className="h-3 w-3" /> پنل مدیریت
          </button>
        </div>
      </footer>
    </div>
  );
}
