// app/page.tsx
'use client';

import { useState, useEffect } from "react";
import { Plus, Timer, Trophy, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// 컴포넌트 임포트 (파일이 존재해야 합니다)
import ExerciseSelector from "@/components/exercise-selector";
import WorkoutComplete from "@/components/workout-complete";
import RestTimer from "@/components/rest-timer";
import RoutineSelector from "@/components/routine-selector";

// lib 파일 임포트 (파일이 존재해야 합니다)
import { getExercisesForRoutine, Routine } from "@/lib/routines";
import { Exercise as LibExercise } from "@/lib/exercises";

interface Set {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [restTimer, setRestTimer] = useState<{ exerciseId: string; setId: string } | null>(null);

  useEffect(() => {
    if (exercises.length > 0 && !workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
  }, [exercises, workoutStartTime]);

  const handleSelectExercise = (exercise: LibExercise) => {
    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      sets: [],
    };
    if (!exercises.some(ex => ex.id === newExercise.id)) {
      setExercises([...exercises, newExercise]);
    }
    setShowExerciseSelector(false);
  };

  const handleSelectRoutine = (routine: Routine) => {
    const routineExercises = getExercisesForRoutine(routine.id);
    const newExercises: Exercise[] = routineExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: [],
    }));
    setExercises(newExercises);
    setShowRoutineSelector(false);
  };

  const addSet = (exerciseId: string) => {
    const newSet: Set = {
      id: Date.now().toString(),
      weight: 0,
      reps: 0,
      completed: false,
    };
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, newSet] } : exercise
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: number) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
            }
          : exercise
      )
    );
  };

  const completeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, completed: true } : set)),
            }
          : exercise
      )
    );
    // setRestTimer({ exerciseId, setId }); // 휴식 타이머 기능은 잠시 비활성화 (필요시 주석 해제)
  };

  const completeWorkout = () => {
    setShowWorkoutComplete(true);
  };

  // 나머지 계산 함수들과 today 변수는 그대로 둡니다.
  const calculateTotalVolume = () => {
    return exercises.reduce((total, exercise) => total + exercise.sets.reduce((exerciseTotal, set) => exerciseTotal + (set.completed ? set.weight * set.reps : 0), 0), 0);
  };
  const calculateWorkoutTime = () => {
    if (!workoutStartTime) return 0;
    return Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60);
  };
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

  // 화면 렌더링 부분
  if (showWorkoutComplete) {
    return (
      <WorkoutComplete
        exercises={exercises}
        totalTime={calculateWorkoutTime()}
        totalVolume={calculateTotalVolume()}
        onBack={() => setShowWorkoutComplete(false)}
        onNewWorkout={() => { setExercises([]); setWorkoutStartTime(null); setShowWorkoutComplete(false); }}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-md">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold">오운완</h1>
          <p className="text-muted-foreground">{today}</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Dialog open={showRoutineSelector} onOpenChange={setShowRoutineSelector}>
            <DialogTrigger asChild>
              <Button className="w-full h-12">루틴 불러오기</Button>
            </DialogTrigger>
            <DialogContent><RoutineSelector onSelect={handleSelectRoutine} /></DialogContent>
          </Dialog>
          <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full h-12">개별 운동 추가</Button>
            </DialogTrigger>
            <DialogContent><ExerciseSelector onSelect={handleSelectExercise} /></DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {exercises.length === 0 && <p className="text-center text-muted-foreground">오늘의 운동을 추가해주세요!</p>}
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader><CardTitle>{exercise.name}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2">
                    <span className="font-mono w-8">{index + 1}</span>
                    <Input type="number" placeholder="kg" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, set.id, "weight", +e.target.value)} disabled={set.completed} />
                    <span>X</span>
                    <Input type="number" placeholder="회" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, set.id, "reps", +e.target.value)} disabled={set.completed} />
                    <Button size="sm" onClick={() => completeSet(exercise.id, set.id)} disabled={set.completed}>{set.completed ? '✓' : '완료'}</Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => addSet(exercise.id)} className="w-full"><Plus size={16} className="mr-2" />세트 추가</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {exercises.length > 0 && (
          <div className="mt-8">
            <Button onClick={completeWorkout} className="w-full h-14 text-lg">운동 완료!</Button>
          </div>
        )}
      </div>
    </main>
  );
}