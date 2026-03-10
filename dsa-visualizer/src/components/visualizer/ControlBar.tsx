import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw,
  Zap
} from 'lucide-react';

interface ControlBarProps {
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onRandomize?: () => void;
  onCustomInput?: () => void;
  stepDescription?: string;
  hideRandomizeText?: string;
  customInputText?: string;
}

// Speed map: slider value 1-5 → ms delay
const SPEED_MAP: Record<number, number> = {
  1: 2000,  // 0.25x
  2: 1000,  // 0.5x
  3: 500,   // 1.0x
  4: 200,   // 2.0x
  5: 50,    // Instant
};
const SPEED_LABELS: Record<number, string> = {
  1: '0.25x', 2: '0.5x', 3: '1x', 4: '2x', 5: '⚡'
};
function msToSlider(ms: number): number {
  const entry = Object.entries(SPEED_MAP).find(([, v]) => v === ms);
  return entry ? Number(entry[0]) : 3;
}

export function ControlBar({
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onRandomize,
  onCustomInput,
  stepDescription,
  hideRandomizeText,
  customInputText
}: ControlBarProps) {
  
  return (
    <div className="flex flex-col gap-4 font-body w-full">

      {/* Step Info Banner — fixed height so layout never shifts */}
      {stepDescription && (
        <div className="bg-[#1a1d2e] border border-[#2f3352] rounded-xl px-4 py-3 flex items-start gap-3 h-[88px] md:h-[56px] overflow-hidden">
          <div className="w-5 h-5 rounded-full border border-indigo-400/50 bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
            <span className="text-xs font-serif italic">i</span>
          </div>
          <p className="text-sm text-slate-300 flex-1 leading-snug overflow-hidden">
            <span className="text-slate-500 mr-2 font-semibold">Step Info:</span>
            <span dangerouslySetInnerHTML={{ __html: stepDescription }} />
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {totalSteps > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1 bg-[#252840] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${Math.round((currentStep / Math.max(totalSteps - 1, 1)) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-500 shrink-0 w-12 text-right">
            {currentStep}/{totalSteps - 1}
          </span>
        </div>
      )}

      {/* Main Control Strip */}
      <div className="bg-[#1a1d2e] border border-[#2f3352] rounded-xl px-4 py-4 md:px-5 md:py-3.5 flex flex-col md:flex-row items-center gap-4 md:gap-5">
        
        {/* Playback Buttons */}
        <div className="flex items-center justify-center gap-2 w-full md:w-auto">
          <button
            onClick={onReset}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30"
            disabled={isPlaying || currentStep === 0}
            title="Reset"
          >
            <RotateCcw size={17} />
          </button>

          <div className="w-px h-5 bg-[#2f3352] mx-1" />

          <button
            onClick={onStepBackward}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30"
            disabled={isPlaying || currentStep === 0}
          >
            <SkipBack size={17} />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-[0_0_20px_rgba(99,102,241,0.35)] mx-1"
          >
            {isPlaying
              ? <Pause size={17} fill="currentColor" />
              : <Play size={17} fill="currentColor" className="ml-0.5" />
            }
          </button>

          <button
            onClick={onStepForward}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30"
            disabled={isPlaying || currentStep >= totalSteps - 1}
          >
            <SkipForward size={17} />
          </button>
        </div>

        {/* Speed Slider - Native range input */}
        <div className="flex items-center gap-3 w-full md:flex-1 md:max-w-xs mt-2 md:mt-0">
          <Zap size={13} className="text-slate-500 shrink-0" />
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={msToSlider(speed)}
            onChange={(e) => onSpeedChange(SPEED_MAP[Number(e.target.value)])}
            className="flex-1 accent-indigo-500 h-1 cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-300 w-8 text-right shrink-0">
            {SPEED_LABELS[msToSlider(speed)]}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 md:ml-auto">
          {onRandomize && (
            <button
              onClick={onRandomize}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-[#252840] hover:bg-[#2f3352] text-slate-200 text-sm font-medium transition-colors border border-[#3a3e5e]"
            >
              {hideRandomizeText || "Randomize"}
            </button>
          )}
          {onCustomInput && (
            <button
              onClick={onCustomInput}
              className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-colors"
            >
              {customInputText || "Custom Input"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
