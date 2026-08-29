'use client';
import React from 'react';

interface OverFeedingAlertProps {
  petName: string;
  loggedCount: number;
  scheduledTarget: number;
}

export default function OverFeedingAlert({
  petName,
  loggedCount,
  scheduledTarget,
}: OverFeedingAlertProps) {
  if (loggedCount <= scheduledTarget) return null;

  const excess = loggedCount - scheduledTarget;

  return (
    <div className="bg-amber-500/15 border-l-4 border-amber-500 text-amber-200 p-4 rounded-r-xl my-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="text-xl">⚠️</span>
        <div>
          <h4 className="font-bold text-amber-100 text-sm">
            Feeding Warning — Exceeded Planned Schedule
          </h4>
          <p className="text-xs text-amber-200/90 mt-1">
            {petName} has received <strong>{loggedCount} feedings</strong> today, exceeding the configured target of <strong>{scheduledTarget}</strong> by {excess} meal{excess > 1 ? 's' : ''}. Please check with other caretakers before feeding again today.
          </p>
        </div>
      </div>
    </div>
  );
}
