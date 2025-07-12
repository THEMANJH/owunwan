"use client"

import { useState, useEffect } from "react"
import { Plus, Timer, Trophy, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ExerciseSelector from "@/components/exercise-selector"
import WorkoutComplete from "@/components/workout-complete"
import RestTimer from "@/components/rest-timer"
import RoutineSelector from "@/components/routine-selector"
import { getExercisesForRoutine } from "@/lib/routines"
import { Routine } from "@/lib/routines" // Routine 타입을 가져옵니다.

// Exercise와 Set 인터페이스는 그대로 둡니다.
interface Set {
  id: string
  weight: number
  reps: number
  completed: boolean
}

interface Exercise {
  id: string
  name: string
  sets: Set[]
}

// WorkoutSession 인터페이스도 그대로 둡니다.
interface WorkoutSession {
  date: string
  exercises: Exercise[]
  totalTime: number
  totalVolume: number
}

export default function HomePage() { // 👈 여기에 여는 중괄호 '{'가 있어야 합니다.

  // --- 상태(useState) 선언부 ---
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [showExerciseSelector, setShowExerciseSelector] = useState(false)
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [restTimer, setRestTimer] = useState<{ exerciseId: string; setId: string } | null>(null)
  const [showRoutineSelector, setShowRoutineSelector] = useState(false) // 👈 추가된 상태

  // --- useEffect ---
  useEffect(() => {
    if (exercises.length > 0 && !workoutStartTime) {
      setWorkoutStartTime(new Date())
    }
  }, [exercises, workoutStartTime])

  // --- 핸들러 함수들 ---
  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [],
    }
    setExercises([...exercises, newExercise])
    setShowExerciseSelector(false)
  }

  // 👇 여기가 수정된 handleSelectRoutine 함수입니다.
  const handleSelectRoutine = (routine: Routine) => {
    const routineExercises = getExercisesForRoutine(routine.id);
    const newExercises: Exercise[] = routineExercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      sets: [],
    }));

    setExercises(newExercises);
    setShowRoutineSelector(false);
  }

  const addSet = (exerciseId: string) => {
    const newSet: Set = {
      id: Date.now().toString(),
      weight: 0,
      reps: 0,
      completed: false,
    }
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, sets: [...exercise.sets, newSet] } : exercise,
      ),
    )
  }

  // updateSet, completeSet, completeWorkout, calculate... 함수들은 그대로 둡니다.
  const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: number) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, [field]: value } : set)),
            }
          : exercise,
      ),
    )
  }

  const completeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((exercise) =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, completed: true } : set)),
            }
          : exercise,
      ),
    )
    setRestTimer({ exerciseId, setId })
  }

  const completeWorkout = () => {
    setShowWorkoutComplete(true)
  }

  const calculateTotalVolume = () => {
    return exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((exerciseTotal, set) => {
          return exerciseTotal + (set.completed ? set.weight * set.reps : 0)
        }, 0)
      )
    }, 0)
  }

  const calculateWorkoutTime = () => {
    if (!workoutStartTime) return 0
    return Math.floor((Date.now() - workoutStartTime.getTime()) / 1000 / 60)
  }

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  
  // --- 화면 렌더링 로직 ---
  if (showWorkoutComplete) {
    return (
      <WorkoutComplete
        exercises={exercises}
        totalTime={calculateWorkoutTime()}
        totalVolume={calculateTotalVolume()}
        onBack={() => setShowWorkoutComplete(false)}
        onNewWorkout={() => {
          setExercises([])
          setWorkoutStartTime(null)
          setShowWorkoutComplete(false)
        }}
      />
    )
  }

  // 👇 추가된 루틴 선택창 로직
  if (showRoutineSelector) {
    return <RoutineSelector onSelect={handleSelectRoutine} />
  }

  if (showExerciseSelector) {
    return <ExerciseSelector onSelect={addExercise} onBack={() => setShowExerciseSelector(false)} />
  }

  // --- 기본 메인 화면 ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {restTimer && <RestTimer onComplete={() => setRestTimer(null)} onSkip={() => setRestTimer(null)} />}

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dumbbell className="w-8 h-8 text-[#007AFF]" />
            <h1 className="text-2xl font-bold text-gray-900">오운완</h1>
          </div>
          <p className="text-gray-600 text-sm">{today}</p>
          <p className="text-[#007AFF] font-medium mt-1">
            {exercises.length === 0 ? "오늘의 운동을 시작하세요!" : "운동 중입니다 💪"}
          </p>
        </div>

        {/* 👇 여기가 수정된 버튼 영역입니다 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setShowRoutineSelector(true)}
            className="h-14 bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium text-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            루틴 불러오기
          </Button>
          <Button
            onClick={() => setShowExerciseSelector(true)}
            variant="outline"
            className="h-14 font-medium text-lg"
          >
            개별 추가
          </Button>
        </div>

        {/* 운동 목록 */}
        <div className="space-y-4 mb-6">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="border-2 border-gray-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-900 flex items-center justify-between">
                  {exercise.name}
                  <Badge variant="secondary" className="bg-[#007AFF]/10 text-[#007AFF]">
                    {exercise.sets.filter((set) => set.completed).length}세트 완료
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {exercise.sets.map((set, index) => (
                  <div key={set.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600 w-12">{index + 1}세트</span>
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        placeholder="kg"
                        value={set.weight || ""}
                        onChange={(e) => updateSet(exercise.id, set.id, "weight", Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center border rounded text-sm"
                        disabled={set.completed}
                      />
                      <span className="text-gray-500">kg</span>
                      <span className="text-gray-400">×</span>
                      <input
                        type="number"
                        placeholder="회"
                        value={set.reps || ""}
                        onChange={(e) => updateSet(exercise.id, set.id, "reps", Number(e.target.value))}
                        className="w-16 px-2 py-1 text-center border rounded text-sm"
                        disabled={set.completed}
                      />
                      <span className="text-gray-500">회</span>
                    </div>
                    {!set.completed && set.weight > 0 && set.reps > 0 && (
                      <Button
                        size="sm"
                        onClick={() => completeSet(exercise.id, set.id)}
                        className="bg-[#FF9500] hover:bg-[#E6850E] text-white"
                      >
                        완료
                      </Button>
                    )}
                    {set.completed && <Badge className="bg-green-100 text-green-800">✓ 완료</Badge>}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => addSet(exercise.id)}
                  className="w-full border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF]/5"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  세트 추가
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 운동 완료 버튼 */}
        {exercises.length > 0 && exercises.some((ex) => ex.sets.some((set) => set.completed)) && (
          // 👇 이 안에서는 운동 완료 버튼만 있도록 수정했습니다.
          <Button
            onClick={completeWorkout}
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-medium text-lg"
          >
            <Trophy className="w-5 h-5 mr-2" />
            운동 완료하기
          </Button>
        )}

        {/* 현재 운동 상태 */}
        {workoutStartTime && (
          <div className="mt-6 p-4 bg-white rounded-lg border text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                운동 시간: {calculateWorkoutTime()}분
              </div>
              <div className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4" />총 볼륨: {calculateTotalVolume()}kg
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}