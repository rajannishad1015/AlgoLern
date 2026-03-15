import { AlgorithmStep } from '@/lib/types/algorithm';

export interface Activity {
  id: number;
  name: string;
  start: number;
  end: number;
}

export function generateGreedyActivitySteps(activities: Activity[]): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];

  // Sort by finish time
  const sorted = [...activities].sort((a, b) => a.end - b.end);

  steps.push({
    id: steps.length,
    type: 'highlight',
    indices: [],
    values: { activities: sorted, selected: [], current: -1 },
    description: `Greedy Activity Selection: Sort ${sorted.length} activities by finish time. Select the activity that ends earliest and doesn't conflict.`,
  });

  steps.push({
    id: steps.length,
    type: 'visit',
    indices: [0],
    values: { activities: sorted, selected: [sorted[0].id], current: sorted[0].id },
    description: `Select first activity "${sorted[0].name}" (${sorted[0].start}–${sorted[0].end}). It has the earliest finish time.`,
  });

  const selected: number[] = [sorted[0].id];
  let lastEnd = sorted[0].end;

  for (let i = 1; i < sorted.length; i++) {
    const act = sorted[i];
    steps.push({
      id: steps.length,
      type: 'compare',
      indices: [i],
      values: { activities: sorted, selected: [...selected], current: act.id },
      description: `Check "${act.name}" (${act.start}–${act.end}). Start ${act.start} ${act.start >= lastEnd ? '≥' : '<'} last end ${lastEnd}. ${act.start >= lastEnd ? '✅ No conflict!' : '❌ Conflicts — skip.'}`,
    });

    if (act.start >= lastEnd) {
      selected.push(act.id);
      lastEnd = act.end;
      steps.push({
        id: steps.length,
        type: 'done',
        indices: [i],
        values: { activities: sorted, selected: [...selected], current: act.id },
        description: `✅ Selected "${act.name}". Last end time updated to ${lastEnd}. Total selected: ${selected.length}.`,
      });
    }
  }

  steps.push({
    id: steps.length,
    type: 'done',
    indices: [],
    values: { activities: sorted, selected: [...selected], current: -1 },
    description: `Done! Selected ${selected.length} non-overlapping activities out of ${sorted.length}. Maximum activities achieved greedily!`,
  });

  return steps;
}
