// components/routine-selector.tsx
'use client';

import { PREMADE_ROUTINES, Routine } from '@/lib/routines';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoutineSelectorProps {
  onSelect: (routine: Routine) => void;
}

export default function RoutineSelector({ onSelect }: RoutineSelectorProps) {
  return (
    <div className="p-1">
      <h2 className="text-lg font-semibold text-center mb-4">추천 루틴</h2>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
        {PREMADE_ROUTINES.map((routine) => (
          <Card key={routine.id}>
            <CardHeader>
              <CardTitle>{routine.name}</CardTitle>
              <CardDescription>by {routine.creator}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => onSelect(routine)}>
                이 루틴 선택하기
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}