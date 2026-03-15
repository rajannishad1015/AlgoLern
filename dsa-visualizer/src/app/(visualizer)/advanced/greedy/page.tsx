"use client";

import { useEffect, useRef, useState } from "react";
import { useVisualizerStore } from "@/lib/store/visualizerStore";
import { Activity, generateGreedyActivitySteps } from "@/lib/algorithms/advanced/greedyActivity";
import { ControlBar } from "@/components/visualizer/ControlBar";
import { VisualizerFrame } from "@/components/visualizer/VisualizerFrame";
import { TheoryCard } from "@/components/visualizer/TheoryCard";
import { Check, X } from "lucide-react";

const defaultActivities: Activity[] = [
  { id: 0, name: "A1", start: 1,  end: 4  },
  { id: 1, name: "A2", start: 3,  end: 5  },
  { id: 2, name: "A3", start: 0,  end: 6  },
  { id: 3, name: "A4", start: 5,  end: 7  },
  { id: 4, name: "A5", start: 3,  end: 9  },
  { id: 5, name: "A6", start: 5,  end: 9  },
  { id: 6, name: "A7", start: 6,  end: 10 },
  { id: 7, name: "A8", start: 8,  end: 11 },
  { id: 8, name: "A9", start: 8,  end: 12 },
  { id: 9, name: "A10", start: 2, end: 14 },
  { id: 10, name: "A11", start: 12, end: 16 },
];

const COLORS = [
  "bg-indigo-500/30 border-indigo-500",
  "bg-violet-500/30 border-violet-500",
  "bg-cyan-500/30 border-cyan-500",
  "bg-pink-500/30 border-pink-500",
  "bg-amber-500/30 border-amber-500",
  "bg-emerald-500/30 border-emerald-500",
  "bg-rose-500/30 border-rose-500",
  "bg-blue-500/30 border-blue-500",
  "bg-orange-500/30 border-orange-500",
  "bg-teal-500/30 border-teal-500",
  "bg-purple-500/30 border-purple-500",
];

function ActivityChart({ activities, selected, current }: {
  activities: Activity[];
  selected: number[];
  current: number;
}) {
  const maxTime = Math.max(...activities.map(a => a.end));
  const sorted = [...activities].sort((a, b) => a.end - b.end);

  return (
    <div className="w-full max-w-2xl px-2">
      {/* Timeline header */}
      <div className="flex items-center mb-2 pl-14">
        {Array.from({ length: maxTime + 1 }, (_, i) => (
          <div key={i} className="flex-1 text-center text-[9px] font-mono text-slate-600">{i}</div>
        ))}
      </div>

      {/* Activity bars */}
      <div className="flex flex-col gap-2">
        {sorted.map((act, idx) => {
          const isSelected = selected.includes(act.id);
          const isCurrent = current === act.id;
          const colorBase = COLORS[act.id % COLORS.length];

          return (
            <div key={act.id} className="flex items-center gap-2">
              {/* Label */}
              <div className={`w-12 shrink-0 text-right text-xs font-mono font-bold transition-all ${
                isSelected ? "text-emerald-400" : isCurrent ? "text-indigo-300" : "text-slate-500"
              }`}>
                {act.name}
              </div>

              {/* Timeline row */}
              <div className="relative flex-1 h-8">
                {/* Tick lines */}
                <div className="absolute inset-0 flex">
                  {Array.from({ length: maxTime + 1 }, (_, i) => (
                    <div key={i} className="flex-1 border-l border-white/5" />
                  ))}
                </div>

                {/* Bar */}
                <div
                  className={`absolute top-1 bottom-1 rounded-md border-2 transition-all duration-500 flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-500/30 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                      : isCurrent
                      ? "bg-indigo-500/30 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse"
                      : colorBase
                  }`}
                  style={{
                    left: `${(act.start / maxTime) * 100}%`,
                    width: `${((act.end - act.start) / maxTime) * 100}%`,
                  }}
                >
                  <span className="text-[9px] font-mono font-bold text-white/70 truncate px-1">
                    {act.start}–{act.end}
                  </span>
                </div>
              </div>

              {/* Status icon */}
              <div className="w-5 shrink-0">
                {isSelected && <Check size={14} className="text-emerald-400" />}
                {!isSelected && isCurrent && <X size={14} className="text-rose-400" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div className="flex items-center mt-1 pl-14 border-t border-white/5 pt-1">
        {Array.from({ length: maxTime + 1 }, (_, i) => (
          <div key={i} className="flex-1 text-center text-[9px] font-mono text-slate-700">{i}</div>
        ))}
      </div>
    </div>
  );
}

export default function GreedyActivityPage() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [activities] = useState<Activity[]>(defaultActivities);

  const {
    steps, currentStepIndex, isPlaying, speed,
    setSteps, setIsPlaying, setSpeed,
    stepForward, stepBackward, resetVisualizer, setAlgorithmId,
  } = useVisualizerStore();

  useEffect(() => {
    setAlgorithmId("greedy-activity");
    setSteps(generateGreedyActivitySteps(activities));
    return () => { resetVisualizer(); if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activities]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        if (currentStepIndex < steps.length - 1) stepForward();
        else { setIsPlaying(false); if (timerRef.current) clearInterval(timerRef.current); }
      }, speed);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, currentStepIndex, steps.length, speed, stepForward, setIsPlaying]);

  const currentStep = steps[currentStepIndex];
  const vals = (currentStep?.values ?? {}) as { activities?: Activity[]; selected?: number[]; current?: number };
  const currentActivities: Activity[] = vals.activities ?? activities;
  const selected: number[] = vals.selected ?? [];
  const current: number = vals.current ?? -1;

  return (
    <div className="bg-gray-50 dark:bg-[#080a12] min-h-screen">
      <VisualizerFrame
        title="Greedy Activity Selection"
        description="Select the maximum number of non-overlapping activities. The greedy choice: always pick the activity that finishes earliest — it leaves the most room for future activities."
        complexity={{ time: "n log n", space: "n", difficulty: "Medium" }}
        controls={
          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-4 bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4">
              <span className="text-xs text-slate-500 font-mono">
                {activities.length} activities · {selected.length} selected
              </span>
              <div className="flex gap-2 ml-auto">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <Check size={12} /> Selected
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
                  ● Current
                </span>
              </div>
            </div>
            <ControlBar
              onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)}
              onStepForward={stepForward} onStepBackward={stepBackward}
              onReset={resetVisualizer} onSpeedChange={setSpeed}
              isPlaying={isPlaying} currentStep={currentStepIndex}
              totalSteps={steps.length} speed={speed}
              stepDescription={currentStep?.description ?? "Press Play to start!"} />
          </div>
        }
        info={
          <TheoryCard
            title="Greedy Activity Selection"
            description="The Activity Selection Problem: given N activities each with a start and end time, select the maximum number of activities that can be performed by a single person, assuming they can only work on one activity at a time. The greedy strategy: always pick the next activity with the earliest finish time."
            descriptionHi="Activity Selection Problem: N activities diye gaye hain, har ek ka start aur end time hai. Ek insaan ek waqt mein sirf ek kaam kar sakta hai — maximum kitne kaam kar sakta hai? Greedy strategy: hamesha wo activity lo jiska end time sabse pehle ho."
            analogy={{
              icon: "📅",
              title: "Meeting Room Booking",
              titleHi: "Meeting Room Book Karna",
              desc: "You have one meeting room for the day. To fit the most meetings, always book the meeting that ends earliest — it frees up the room for more future meetings.",
              descHi: "Ek meeting room hai pura din ke liye. Zyada meetings fit karne ke liye hamesha wo meeting lo jo sabse pehle khatam ho — isse room jaldi free hoga aur zyada meetings ho sakti hain."
            }}
            readingTip={{
              en: "Greedy works here because picking the earliest-ending activity never leaves us worse off — it can only give more time for future activities.",
              hi: "Greedy yahan kaam karta hai kyunki sabse jaldi khatam hone wali activity chunna kabhi nuksan nahi karta — hamesha future ke liye zyada time milta hai."
            }}
            complexities={[
              { case: "Sort",   time: "n log n", space: "n", note: "Sort activities by finish time." },
              { case: "Select", time: "n",       space: "1", note: "Single linear pass to select." },
              { case: "Total",  time: "n log n", space: "n", note: "Dominated by sorting step." },
            ]}
            pseudocode={`function activitySelection(activities):
  sort(activities, key=finish_time)
  selected = [activities[0]]
  lastEnd = activities[0].end

  for i = 1 to n-1:
    if activities[i].start >= lastEnd:
      selected.add(activities[i])
      lastEnd = activities[i].end

  return selected`}
            useCases={[
              "Meeting room / resource scheduling.",
              "CPU job scheduling (shortest job first variant).",
              "Interval scheduling maximization.",
              "Event planning and calendar optimization.",
            ]}
            useCasesHi={[
              "Meeting room aur resource scheduling.",
              "CPU job scheduling.",
              "Interval scheduling maximization.",
              "Events aur calendar optimization.",
            ]}
            howItWorks={{
              en: [
                { icon: "📋", text: "Sort all activities by their finish time (ascending)." },
                { icon: "✅", text: "Always select the first activity — it ends earliest." },
                { icon: "🔍", text: "For each next activity: if start ≥ last selected end → select it." },
                { icon: "⏭️", text: "Otherwise skip it (it overlaps with the last selected)." },
                { icon: "🏆", text: "Result is the maximum set of non-overlapping activities." },
              ],
              hi: [
                { icon: "📋", text: "Saari activities ko finish time ke hisaab se sort karo." },
                { icon: "✅", text: "Pehli activity hamesha lo — yeh sabse jaldi khatam hoti hai." },
                { icon: "🔍", text: "Har next activity ke liye: agar start ≥ last end → lo isse." },
                { icon: "⏭️", text: "Warna skip karo (overlap hai pichli selected se)." },
                { icon: "🏆", text: "Result sabse zyada non-overlapping activities ka set hai." },
              ]
            }}
            code={{
              language: "javascript",
              content: `function activitySelection(activities) {
  // Sort by finish time — the greedy key insight
  activities.sort((a, b) => a.end - b.end);

  const selected = [activities[0]];
  let lastEnd = activities[0].end;

  for (let i = 1; i < activities.length; i++) {
    if (activities[i].start >= lastEnd) {
      selected.push(activities[i]);
      lastEnd = activities[i].end;
    }
  }
  return selected;
}`
            }}
            quiz={[
              {
                q: "What is the greedy criterion for Activity Selection?",
                options: ["Pick activity with longest duration", "Pick activity with earliest start time", "Pick activity with earliest finish time", "Pick activity with most overlap"],
                answer: 2,
              },
              {
                q: "Why does Activity Selection need sorted activities?",
                options: ["For random access", "To find the earliest finish time first", "To count overlaps", "Sorting isn't needed"],
                answer: 1,
              },
              {
                q: "What is the overall time complexity of Greedy Activity Selection?",
                options: ["O(n)", "O(n²)", "O(n log n)", "O(2ⁿ)"],
                answer: 2,
              },
            ]}
          />
        }
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-6 overflow-auto">
          {/* Stats */}
          <div className="flex gap-6 flex-wrap justify-center">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Total</span>
              <span className="text-2xl font-bold font-mono text-white">{currentActivities.length}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Selected</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{selected.length}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Skipped</span>
              <span className="text-2xl font-bold font-mono text-rose-400">{currentActivities.length - selected.length}</span>
            </div>
          </div>
          <ActivityChart activities={currentActivities} selected={selected} current={current} />
          <p className="text-xs text-slate-600 font-mono">Activities sorted by finish time. Green = selected, Pulsing = currently evaluating.</p>
        </div>
      </VisualizerFrame>
    </div>
  );
}
