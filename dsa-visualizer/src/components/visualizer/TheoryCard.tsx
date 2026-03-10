import { useState } from "react";
import { CheckCircle2, Lightbulb, BookOpen, Cpu, HelpCircle, Languages } from "lucide-react";

interface ComplexityRow {
  case: string;
  time: string;
  space: string;
  note?: string;
}

interface ExampleStep {
  desc: string;
  descHi?: string;
  array: number[];
  highlight: number[];
}

interface TheoryCardProps {
  title: string;
  description: string;
  descriptionHi?: string;
  complexities: ComplexityRow[];
  pseudocode: string;
  useCases: string[];
  useCasesHi?: string[];
  analogy?: {
    icon: string;
    title: string;
    titleHi: string;
    desc: string;
    descHi: string;
  };
  readingTip?: {
    en: string;
    hi: string;
  };
  quote?: {
    en: string;
    hi: string;
  };
  example?: {
    array: number[];
    steps: ExampleStep[];
  };
  howItWorks?: {
    en: { icon: string; text: string }[];
    hi: { icon: string; text: string }[];
  };
  code?: { language: string; content: string };
  quiz?: { q: string; options: string[]; answer: number }[];
}

function ArrayDisplay({ arr, highlight }: { arr: number[]; highlight: number[] }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {arr.map((v, i) => (
        <div
          key={i}
          className={`w-9 h-9 flex items-center justify-center rounded-lg font-mono font-bold text-sm transition-all ${
            highlight.includes(i)
              ? "bg-[#cbff5e] text-[#0d0f1a] shadow-[0_0_12px_rgba(203,255,94,0.5)]"
              : "bg-black/[0.06] dark:bg-[#1a1d2e] text-black/70 dark:text-slate-300 border border-black/5 dark:border-[#2f3352]"
          }`}
        >
          {v}
        </div>
      ))}
    </div>
  );
}

export function TheoryCard({
  title,
  description,
  descriptionHi,
  complexities,
  pseudocode,
  useCases,
  useCasesHi,
  analogy,
  readingTip,
  quote,
  example,
  howItWorks,
  code,
  quiz,
}: TheoryCardProps) {
  const [activeTab, setActiveTab] = useState<"theory" | "example" | "pseudocode" | "complexity" | "code" | "quiz">("theory");
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [lang, setLang] = useState<"en" | "hi">("en");

  const isHi = lang === "hi";

  const tabs: Array<typeof activeTab> = ["theory", "example", "pseudocode", "complexity"];
  if (code) tabs.push("code");
  if (quiz) tabs.push("quiz");

  const tabIcons: Record<string, React.ReactNode> = {
    theory: <BookOpen size={13} />,
    example: <Lightbulb size={13} />,
    pseudocode: <Cpu size={13} />,
    complexity: <span className="font-mono text-[10px] font-bold">O(n)</span>,
    code: <Cpu size={13} />,
    quiz: <HelpCircle size={13} />,
  };

  const desc = isHi && descriptionHi ? descriptionHi : description;
  const cases = isHi && useCasesHi ? useCasesHi : useCases;

  return (
    <div className="flex flex-col w-full font-body bg-white dark:bg-[#0d0f1a] border border-black/10 dark:border-[#252840] rounded-xl overflow-hidden shadow-sm">

      {/* Modern Header: Title + Language Toggle */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-[#252840] bg-black/[0.01] dark:bg-[#0d101d]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold text-black dark:text-white uppercase tracking-wider font-display">
              Algorithm Theory
            </h2>
            <p className="text-[10px] text-black/40 dark:text-slate-500 font-medium uppercase tracking-widest leading-none mt-0.5">
              Curriculum & Guides
            </p>
          </div>
        </div>

        {/* Compact Language Toggle Pill */}
        <div className="flex bg-black/5 dark:bg-[#1a1d2e] p-1 rounded-full border border-black/5 dark:border-white/5">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
              lang === "en"
                ? "bg-white dark:bg-[#2f3352] text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-black/40 dark:text-slate-500 hover:text-black dark:hover:text-white"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("hi")}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
              lang === "hi"
                ? "bg-white dark:bg-[#2f3352] text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-black/40 dark:text-slate-500 hover:text-black dark:hover:text-white"
            }`}
          >
            HI
          </button>
        </div>
      </div>

      {/* Segmented Pill Navigation */}
      <div className="bg-black/[0.02] dark:bg-[#111428] px-4 py-3 border-b border-black/10 dark:border-[#252840] overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shrink-0 ${
                activeTab === tab
                  ? "bg-black/5 dark:bg-white/5 text-black dark:text-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                  : "text-black/40 dark:text-slate-500 hover:text-black/60 dark:hover:text-slate-300 hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
              }`}
            >
              <span className={activeTab === tab ? "text-indigo-500 dark:text-indigo-400" : ""}>
                {tabIcons[tab]}
              </span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-5 md:p-8 min-h-[400px]">

        {/* ── THEORY TAB ── */}
        {activeTab === "theory" && (
          <div className="flex flex-col gap-7 md:gap-9 animate-in fade-in duration-500">

            <div className="flex flex-col gap-2.5">
              <h3 className="text-lg md:text-2xl font-bold text-black dark:text-white tracking-tight leading-snug font-display">
                {isHi ? `${title} kya hai?` : `What is ${title}?`}
              </h3>
              <p className="text-black/70 dark:text-slate-300 leading-relaxed text-sm md:text-base">{desc}</p>
            </div>

            {/* Analogy Card - Enhanced */}
            {analogy && (
              <div className="relative group overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-500/10 dark:to-[#0d0f1a] border border-indigo-200/50 dark:border-indigo-500/20 rounded-3xl p-5 md:p-7 flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:text-center w-full sm:w-24 shrink-0 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#1a1d2e] shadow-sm flex items-center justify-center text-3xl shrink-0 border border-black/5 dark:border-white/5">
                    {analogy.icon}
                  </div>
                  <p className="font-bold text-black dark:text-white text-sm sm:text-xs uppercase tracking-widest sm:hidden">
                    The Analogy
                  </p>
                </div>
                <div className="relative z-10">
                  <p className="font-bold text-black dark:text-white text-sm mb-2 hidden sm:block uppercase tracking-widest opacity-40">
                    The Analogy
                  </p>
                  <h4 className="font-bold text-black dark:text-white mb-2 hidden sm:block font-display text-lg">
                    {isHi ? analogy.titleHi : analogy.title}
                  </h4>
                  <p className="text-[13px] md:text-sm text-black/65 dark:text-slate-400 leading-relaxed md:leading-loose">
                    {isHi ? analogy.descHi : analogy.desc}
                  </p>
                </div>
              </div>
            )}

            {/* Step by Step - Cleaned up */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs md:text-sm font-bold text-black/40 dark:text-slate-500 uppercase tracking-[0.2em]">
                {isHi ? "Kaise Kaam Karta Hai" : "How it Works"}
              </h3>
              <div className="flex flex-col gap-3">
                {(isHi
                  ? (howItWorks?.hi ?? [
                    { icon: "1️⃣", text: "Pehle element se shuru karo. Usse uske agle element se compare karo." },
                    { icon: "2️⃣", text: "Agar pehla BADA hai aur doosra CHHOTA — swap karo. Ab bada wala daayein chala gaya!" },
                    { icon: "3️⃣", text: "Agla pair dekho. Har pair ke liye compare + swap karo." },
                    { icon: "4️⃣", text: "Ek poori pass ke baad, SABSE BADA number last position pe aa jaata hai. Lock! 🔒" },
                    { icon: "5️⃣", text: "Baaki elements ke liye phir se yahi karo (har baar last sorted wale ko ignore karo)." },
                    { icon: "✅", text: "Aise karte raho jab tak ek bhi swap na ho. Array sorted ho gaya!" },
                  ])
                  : (howItWorks?.en ?? [
                    { icon: "1️⃣", text: "Start from the first element. Compare it with the next one." },
                    { icon: "2️⃣", text: "If the first one is BIG and the second one is SMALL — swap them. Now the big one moved right!" },
                    { icon: "3️⃣", text: "Move to the next pair. Repeat the compare + swap for all pairs." },
                    { icon: "4️⃣", text: "After one full pass, the LARGEST number is now at the last position. It's sorted! 🔒" },
                    { icon: "5️⃣", text: "Do the same again for remaining elements (ignore the last sorted ones each time)." },
                    { icon: "✅", text: "Keep repeating until no swaps happen in a full pass. The array is sorted!" },
                  ])
                ).map((step, i) => (
                  <div key={i} className="flex gap-4 items-start bg-black/[0.01] dark:bg-[#1a1d2e]/40 border border-black/[0.03] dark:border-white/5 rounded-2xl px-5 py-4 transition-colors hover:bg-black/[0.02] dark:hover:bg-[#1a1d2e]">
                    <span className="text-xl shrink-0 leading-none">{step.icon}</span>
                    <span className="text-sm leading-relaxed text-black/70 dark:text-slate-300 font-medium">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Properties */}
            <div className="flex flex-col gap-4">
               <h3 className="text-xs md:text-sm font-bold text-black/40 dark:text-slate-500 uppercase tracking-[0.2em]">Key Properties</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cases.map((uc, i) => (
                  <div key={i} className="flex gap-3 items-start bg-black/[0.02] dark:bg-[#111428] rounded-xl px-4 py-3.5 border border-black/[0.03] dark:border-white/[0.03]">
                    <CheckCircle2 size={16} className="text-indigo-500 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <span className="text-[13px] text-black/70 dark:text-slate-300 font-medium">{uc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            {quote && (
              <div className="bg-black/[0.03] dark:bg-[#1a1d2e] border border-black/5 dark:border-[#2f3352] rounded-2xl p-5 md:p-6 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#cbff5e] rounded-l-2xl group-hover:w-2 transition-all" />
                <p className="text-[13px] md:text-sm italic text-black/60 dark:text-slate-400 leading-relaxed font-medium pl-3">
                  {isHi ? quote.hi : quote.en}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── EXAMPLE TAB ── */}
        {activeTab === "example" && example && (
          <div className="flex flex-col gap-7 animate-in slide-in-from-bottom-2 duration-500">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-1 font-display tracking-tight">
                Walkthrough
              </h3>
              <p className="text-xs md:text-sm text-black/50 dark:text-slate-500 font-medium tracking-wide">
                {isHi
                  ? <>Step-by-step sorting on <span className="font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-black dark:text-white">[{example.array.join(", ")}]</span></>
                  : <>Step-by-step sorting on <span className="font-mono bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-black dark:text-white">[{example.array.join(", ")}]</span></>}
              </p>
            </div>
            <div className="flex flex-col gap-4">
              {example.steps.map((step, i) => (
                <div key={i} className="bg-white dark:bg-[#1a1d2e] border border-black/5 dark:border-[#2f3352] rounded-2xl p-5 flex flex-col gap-4 shadow-sm group hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-lg shadow-indigo-500/20">
                      {i + 1}
                    </div>
                    <p className="text-sm text-black/70 dark:text-slate-300 font-semibold leading-relaxed">
                      {isHi && step.descHi ? step.descHi : step.desc}
                    </p>
                  </div>
                  <div className="pl-0 sm:pl-12 overflow-x-auto scrollbar-hide py-1">
                    <ArrayDisplay arr={step.array} highlight={step.highlight} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl shrink-0">
                🎉
              </div>
              <p className="text-sm text-black/70 dark:text-slate-300 leading-relaxed font-medium self-center">
                {isHi
                  ? <><strong>Ho gaya!</strong> Array poora sorted hai. {title} complete! ✨</>
                  : <><strong>Done!</strong> The array is fully sorted. {title} complete! ✨</>}
              </p>
            </div>
          </div>
        )}

        {activeTab === "example" && !example && (
          <div className="flex items-center justify-center h-48 text-black/30 dark:text-slate-600 font-mono text-sm">No example provided.</div>
        )}

        {/* ── PSEUDOCODE TAB ── (always English) */}
        {activeTab === "pseudocode" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-black dark:text-white">Pseudocode</h3>
            <pre className="bg-black/[0.03] dark:bg-[#080a12] border border-black/5 dark:border-[#252840] rounded-xl p-6 text-sm font-mono text-black/80 dark:text-slate-300 overflow-x-auto leading-loose">
              <code>
                {pseudocode.split("\n").map((line, i) => (
                  <div key={i} className="flex gap-5 hover:bg-black/5 dark:hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                    <span className="w-5 text-black/20 dark:text-slate-600 select-none text-right shrink-0">{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </code>
            </pre>
            {readingTip && (
              <div className="bg-black/[0.03] dark:bg-[#1a1d2e] border border-black/5 dark:border-[#2f3352] rounded-xl p-5 text-sm text-black/60 dark:text-slate-400 leading-relaxed">
                {isHi
                  ? <><strong className="text-black dark:text-white">Padhne ka tarika:</strong> {readingTip.hi}</>
                  : <><strong className="text-black dark:text-white">Reading tip:</strong> {readingTip.en}</>}
              </div>
            )}
          </div>
        )}

        {/* ── COMPLEXITY TAB ── (always English numbers, short note can be Hinglish) */}
        {activeTab === "complexity" && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white mb-1">Time & Space Complexity</h3>
              <p className="text-sm text-black/50 dark:text-slate-500">Big-O notation — how performance scales with input size n</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {complexities.map((c, i) => (
                <div key={i} className="bg-black/[0.03] dark:bg-[#1a1d2e] border border-black/5 dark:border-[#2f3352] rounded-xl p-4 md:p-6 flex flex-col gap-2">
                  <div className={`text-[10px] md:text-xs uppercase font-bold tracking-widest ${
                    c.case === "Best" ? "text-emerald-500" : c.case === "Average" ? "text-amber-500" : "text-red-400"
                  }`}>{c.case} Case</div>
                  <div className="text-2xl md:text-3xl font-display text-black dark:text-white">O({c.time})</div>
                  <div className="text-[10px] md:text-xs text-black/50 dark:text-slate-500 font-mono">Space: O({c.space})</div>
                  {c.note && <p className="text-[10px] md:text-xs text-black/50 dark:text-slate-500 leading-relaxed mt-1">{c.note}</p>}
                </div>
              ))}
            </div>
            <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm text-black/70 dark:text-slate-300 leading-relaxed">
              {isHi
                ? <><strong>Kab use karein:</strong> Sirf chhote arrays (&lt;50 elements) ya learning ke liye. Real projects mein QuickSort (O(n log n)) ya Merge Sort use karo. Bubble Sort ki taakat hai simplicity — samajhna aasaan hai.</>
                : <><strong>When to use:</strong> Only for small arrays (&lt;50 elements) or educational purposes. For real applications, use QuickSort (O(n log n)) or Merge Sort. Bubble Sort&apos;s strength is simplicity and being easy to understand.</>}
            </div>
          </div>
        )}

        {/* ── CODE TAB ── (always English) */}
        {activeTab === "code" && code && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-black dark:text-white">Implementation — {code.language}</h3>
            <pre className="bg-black/[0.03] dark:bg-[#080a12] border border-black/5 dark:border-[#252840] rounded-xl p-6 text-sm font-mono text-black/80 dark:text-slate-300 overflow-x-auto leading-loose">
              <code>
                {code.content.split("\n").map((line, i) => (
                  <div key={i} className="flex gap-5 hover:bg-black/5 dark:hover:bg-white/5 px-2 -mx-2 rounded transition-colors">
                    <span className="w-5 text-black/20 dark:text-slate-600 select-none text-right shrink-0">{i + 1}</span>
                    <span>{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}

        {/* ── QUIZ TAB ── (always English) */}
        {activeTab === "quiz" && quiz && (
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-bold text-black dark:text-white">Quick Quiz 🧠</h3>
            {quiz.map((q, qi) => (
              <div key={qi} className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-black/80 dark:text-slate-200">{qi + 1}. {q.q}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = quizAnswers[qi] === oi;
                    const correct = oi === q.answer;
                    const answered = quizAnswers[qi] !== undefined;
                    return (
                      <button
                        key={oi}
                        onClick={() => !answered && setQuizAnswers(prev => ({ ...prev, [qi]: oi }))}
                        className={`px-4 py-3 rounded-lg text-sm text-left transition-all border ${
                          answered
                            ? correct
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                              : selected
                              ? "bg-red-500/15 border-red-500/40 text-red-500"
                              : "bg-black/[0.03] dark:bg-[#1a1d2e] border-black/5 dark:border-[#2f3352] text-black/40 dark:text-slate-600"
                            : "bg-black/[0.03] dark:bg-[#1a1d2e] border-black/5 dark:border-[#2f3352] text-black/70 dark:text-slate-300 hover:border-indigo-400/50 hover:text-black dark:hover:text-white"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>



    </div>
  );
}
