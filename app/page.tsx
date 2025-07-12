// app/page.tsx
'use client';

import { useState, useEffect } from "react";
import { Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// 다른 컴포넌트 및 lib 파일들을 가져옵니다.
// 이 파일들이 실제로 components와 lib 폴더에 존재해야 합니다.
import ExerciseSelector from "@/components/exercise-selector";
import WorkoutComplete from "@/components/workout-complete";
import RestTimer from "@/components/rest-timer";
import RoutineSelector from "@/components/routine-selector";
import { getExercisesForRoutine, Routine } from "@/lib/routines";
import { Exercise as LibExercise } from "@/lib/exercises";

// 데이터 타입 정의
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

// 메인 페이지 컴포넌트
export default function HomePage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  // 나머지 상태 및 함수들은 이전과 동일합니다.
  useEffect(() => {
    if (exercises.length > 0 && !workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
  }, [exercises, workoutStartTime]);

  const handleSelectExercise = (exercise: LibExercise) => {
    const newExercise: Exercise = { id: exercise.id, name: exercise.name, sets: [] };
    if (!exercises.some(ex => ex.id === newExercise.id)) {
      setExercises([...exercises, newExercise]);
    }
    setShowExerciseSelector(false);
  };

  const handleSelectRoutine = (routine: Routine) => {
    const routineExercises = getExercisesForRoutine(routine.id);
    const newExercises: Exercise[] = routineExercises.map(ex => ({ id: ex.id, name: ex.name, sets: [] }));
    setExercises(newExercises);
    setShowRoutineSelector(false);
  };

  const addSet = (exerciseId: string) => {
    const newSet: Set = { id: Date.now().toString(), weight: 0, reps: 0, completed: false };
    setExercises(
      exercises.map(ex => (ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex))
    );
  };

  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: number) => {
    setExercises(
      exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map(set => (set.id === setId ? { ...set, [field]: value } : set)) }
          : ex
      )
    );
  };

  const completeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map(set => (set.id === setId ? { ...set, completed: true } : set)) }
          : ex
      )
    );
  };

  const completeWorkout = () => { setShowWorkoutComplete(true); };

  const calculateTotalVolume = () => exercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, set) => exTotal + (set.completed ? set.weight * set.reps : 0), 0), 0);
  const calculateWorkoutTime = () => workoutStartTime ? Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60) : 0;
  const today = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });


  if (showWorkoutComplete) {
    return <WorkoutComplete exercises={exercises} totalTime={calculateWorkoutTime()} totalVolume={calculateTotalVolume()} onBack={() => setShowWorkoutComplete(false)} onNewWorkout={() => { setExercises([]); setWorkoutStartTime(null); setShowWorkoutComplete(false); }} />;
  }

  // 여기가 화면을 그리는 부분입니다. (JSX)
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-md p-4">
        <header className="text-center my-6">
          <h1 className="text-3xl font-bold tracking-tight">오운완</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Dialog open={showRoutineSelector} onOpenChange={setShowRoutineSelector}>
            <DialogTrigger asChild>
              <Button className="h-12 w-full">루틴 불러오기</Button>
            </DialogTrigger>
            <DialogContent><RoutineSelector onSelect={handleSelectRoutine} /></DialogContent>
          </Dialog>
          <Dialog open={showExerciseSelector} onOpenChange={setShowExerciseSelector}>
            <DialogTrigger asChild>
              <Button variant="outline" className="h-12 w-full">개별 운동 추가</Button>
            </DialogTrigger>
            <DialogContent><ExerciseSelector onSelect={handleSelectExercise} /></DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {exercises.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">오늘의 운동을 추가해주세요!</p>
            </div>
          )}

          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader><CardTitle>{exercise.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2">
                    <span className="w-8 text-center font-mono text-sm text-gray-500">{index + 1}</span>
                    <Input type="number" placeholder="kg" onChange={(e) => updateSet(exercise.id, set.id, "weight", Number(e.target.value))} disabled={set.completed} />
                    <span className="text-gray-400">X</span>
                    <Input type="number" placeholder="회" onChange={(e) => updateSet(exercise.id, set.id, "reps", Number(e.target.value))} disabled={set.completed} />
                    <Button size="sm" onClick={() => completeSet(exercise.id, set.id)} disabled={set.completed}>
                      {set.completed ? '✓' : '완료'}
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addSet(exercise.id)} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> 세트 추가
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {exercises.length > 0 && exercises.some(ex => ex.sets.some(s => s.completed)) && (
          <div className="mt-8">
            <Button size="lg" onClick={completeWorkout} className="w-full h-14 text-lg">
              <Trophy className="w-5 h-5 mr-2" /> 운동 완료!
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}