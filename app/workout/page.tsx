"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// UI 컴포넌트
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trophy } from "lucide-react";

// 당신이 만든 커스텀 컴포넌트들을 모두 가져옵니다.
import ExerciseSelector from "@/components/exercise-selector";
import RoutineSelector from "@/components/routine-selector";
import RestTimer from "@/components/rest-timer";
import WorkoutComplete from "@/components/workout-complete";

// lib 파일 (루틴, 운동 목록 등)
import { getExercisesForRoutine, Routine } from "@/lib/routines";

// --- 데이터 타입 정의 ---
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

// --- 메인 운동 페이지 컴포넌트 ---
export default function WorkoutPage() {
  const router = useRouter();

  // --- 상태 관리 (State) ---
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showRoutineSelector, setShowRoutineSelector] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);

  // --- 데이터 로직 (useEffect) ---
  useEffect(() => {
    if (exercises.length > 0 && !workoutStartTime) {
      setWorkoutStartTime(new Date());
    }
  }, [exercises, workoutStartTime]);

  // --- 핸들러 함수들 ---
  const handleSelectExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: `${exerciseName}-${Date.now()}`,
      name: exerciseName,
      sets: [{ id: Date.now().toString(), weight: 0, reps: 0, completed: false }],
    };
    if (!exercises.some(ex => ex.name === newExercise.name)) {
      setExercises([...exercises, newExercise]);
    }
    setShowExerciseSelector(false);
  };

  const handleSelectRoutine = (routine: Routine) => {
    const routineExercises = getExercisesForRoutine(routine.id);
    const newExercises: Exercise[] = routineExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: [{ id: Date.now().toString(), weight: 0, reps: 0, completed: false }],
    }));
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
    setShowRestTimer(true); // 세트 완료 시 휴식 타이머 표시
  };

  const completeWorkout = () => {
    const workoutData = {
      createdAt: new Date().toISOString(),
      totalTime: calculateWorkoutTime(),
      totalVolume: calculateTotalVolume(),
      exercises: exercises,
    };
    try {
      const existingWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const updatedWorkouts = [...existingWorkouts, workoutData];
      localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
      setShowWorkoutComplete(true);
    } catch (e) {
      console.error("로컬 저장소에 기록 저장 중 에러: ", e);
      alert("기록 저장에 실패했습니다.");
    }
  };

  // 계산 함수들
  const calculateTotalVolume = () => exercises.reduce((total, ex) => total + ex.sets.reduce((exTotal, set) => exTotal + (set.completed ? set.weight * set.reps : 0), 0), 0);
  const calculateWorkoutTime = () => workoutStartTime ? Math.floor((new Date().getTime() - workoutStartTime.getTime()) / 1000 / 60) : 0;

  // --- 화면 렌더링 (JSX) ---

  // 1. 운동 완료 화면
  if (showWorkoutComplete) {
    return <WorkoutComplete exercises={exercises} totalTime={calculateWorkoutTime()} totalVolume={calculateTotalVolume()} onBack={() => setShowWorkoutComplete(false)} onNewWorkout={() => router.push('/')} />;
  }
  
  // 2. 운동 선택 화면
  if (showExerciseSelector) {
    return <ExerciseSelector onSelect={handleSelectExercise} onBack={() => setShowExerciseSelector(false)} />;
  }

  // 3. 루틴 선택 화면
  if (showRoutineSelector) {
    return (
      <div className="p-4">
        <Button onClick={() => setShowRoutineSelector(false)} variant="ghost" size="icon" className="mb-4"><ArrowLeft /></Button>
        <RoutineSelector onSelect={handleSelectRoutine} />
      </div>
    );
  }

  // 4. 기본 운동 기록 화면
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 휴식 타이머는 조건부로 화면 전체를 덮습니다. */}
      {showRestTimer && <RestTimer onComplete={() => setShowRestTimer(false)} onSkip={() => setShowRestTimer(false)} />}

      <div className="container mx-auto max-w-md p-4">
        <header className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}><ArrowLeft /></Button>
          <h1 className="text-xl font-bold">오늘의 운동</h1>
          <div className="w-10"></div>
        </header>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button onClick={() => setShowRoutineSelector(true)} className="w-full">루틴 불러오기</Button>
          <Button onClick={() => setShowExerciseSelector(true)} variant="outline" className="w-full">개별 운동 추가</Button>
        </div>

        <div className="space-y-4 pb-24">
          {exercises.length === 0 && (
            <div className="text-center py-10 text-gray-500"><p>운동을 추가하여 기록을 시작하세요!</p></div>
          )}
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader><CardTitle>{exercise.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
                    <span className="w-8 text-center font-mono text-sm">{index + 1}</span>
                    <Input type="number" placeholder="kg" onChange={(e) => updateSet(exercise.id, set.id, "weight", Number(e.target.value))} disabled={set.completed} />
                    <span className="text-gray-400">X</span>
                    <Input type="number" placeholder="회" onChange={(e) => updateSet(exercise.id, set.id, "reps", Number(e.target.value))} disabled={set.completed} />
                    <Button size="sm" onClick={() => completeSet(exercise.id, set.id)} disabled={set.completed}>
                      {set.completed ? '✓' : '완료'}
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={() => addSet(exercise.id)} className="w-full"><Plus className="w-4 h-4 mr-2" />세트 추가</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {exercises.length > 0 && exercises.some(ex => ex.sets.some(s => s.completed)) && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
            <Button size="lg" onClick={completeWorkout} className="w-full h-14 text-lg shadow-lg">
              <Trophy className="w-5 h-5 mr-2" /> 운동 완료!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
