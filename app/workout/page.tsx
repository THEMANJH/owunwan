"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Plus, Timer, Weight, RotateCcw, Check, Search, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { saveWorkoutSession, type Exercise } from "@/lib/firestore"
import { auth } from "@/lib/firebase"

const EXERCISE_DATABASE = [
  { id: 1, name: "벤치프레스", category: "가슴", muscle: "대흉근" },
  { id: 2, name: "스쿼트", category: "하체", muscle: "대퇴사두근" },
  { id: 3, name: "데드리프트", category: "등", muscle: "광배근" },
  { id: 4, name: "오버헤드프레스", category: "어깨", muscle: "삼각근" },
  { id: 5, name: "바벨로우", category: "등", muscle: "광배근" },
  { id: 6, name: "딥스", category: "가슴", muscle: "대흉근" },
  { id: 7, name: "풀업", category: "등", muscle: "광배근" },
  { id: 8, name: "레그프레스", category: "하체", muscle: "대퇴사두근" },
]

const RECOMMENDED_ROUTINES = [
  {
    id: 1,
    name: "초보자 상체 루틴",
    exercises: [
      {
        id: 1,
        name: "벤치프레스",
        sets: [
          { weight: 40, reps: 12 },
          { weight: 45, reps: 10 },
          { weight: 50, reps: 8 },
        ],
      },
      {
        id: 4,
        name: "오버헤드프레스",
        sets: [
          { weight: 20, reps: 12 },
          { weight: 25, reps: 10 },
        ],
      },
      {
        id: 6,
        name: "딥스",
        sets: [
          { weight: 0, reps: 10 },
          { weight: 0, reps: 8 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "하체 집중 루틴",
    exercises: [
      {
        id: 2,
        name: "스쿼트",
        sets: [
          { weight: 60, reps: 12 },
          { weight: 70, reps: 10 },
          { weight: 80, reps: 8 },
        ],
      },
      {
        id: 8,
        name: "레그프레스",
        sets: [
          { weight: 100, reps: 15 },
          { weight: 120, reps: 12 },
        ],
      },
      {
        id: 3,
        name: "데드리프트",
        sets: [
          { weight: 80, reps: 8 },
          { weight: 90, reps: 6 },
        ],
      },
    ],
  },
]

export default function WorkoutPage() {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingExercise, setIsAddingExercise] = useState(false)
  const [startTime] = useState(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [restTime, setRestTime] = useState(60)
  const [isResting, setIsResting] = useState(false)
  const [restTimer, setRestTimer] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const workoutDate = searchParams.get("date") || format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isResting && restTimer > 0) {
      timer = setTimeout(() => {
        setRestTimer(restTimer - 1)
      }, 1000)
    } else if (isResting && restTimer === 0) {
      setIsResting(false)
      toast({
        title: "휴식 완료!",
        description: "다음 세트를 시작하세요",
      })
    }
    return () => clearTimeout(timer)
  }, [isResting, restTimer, toast])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const addExercise = (exerciseData: (typeof EXERCISE_DATABASE)[0]) => {
    const newExercise: Exercise = {
      id: exerciseData.id,
      name: exerciseData.name,
      sets: [],
    }
    setExercises([...exercises, newExercise])
    setCurrentExercise(newExercise)
    setIsAddingExercise(false)
  }

  const loadRoutine = (routine: (typeof RECOMMENDED_ROUTINES)[0]) => {
    const routineExercises: Exercise[] = routine.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: ex.sets.map((set) => ({ ...set, completed: false })),
    }))
    setExercises(routineExercises)
    setCurrentExercise(routineExercises[0])
    setIsAddingExercise(false)
  }

  const addSet = (exerciseId: number, weight: number, reps: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, { weight, reps, completed: false }] } : ex,
      ),
    )
  }

  const toggleSetComplete = (exerciseId: number, setIndex: number) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((set, idx) => (idx === setIndex ? { ...set, completed: !set.completed } : set)),
            }
          : ex,
      ),
    )

    // 세트 완료 시 휴식 시작
    if (!isResting) {
      setIsResting(true)
      setRestTimer(restTime)
    }
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

  const completeWorkout = async () => {
    if (!auth.currentUser) return

    const workoutSession = {
      userId: auth.currentUser.uid,
      date: new Date(workoutDate),
      exercises,
      totalTime: elapsedTime,
      totalVolume: calculateTotalVolume(),
      createdAt: new Date(),
    }

    try {
      await saveWorkoutSession(workoutSession)
      router.push(`/workout/complete?date=${workoutDate}&time=${elapsedTime}&volume=${calculateTotalVolume()}`)
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "운동 기록 저장에 실패했습니다",
        variant: "destructive",
      })
    }
  }

  const filteredExercises = EXERCISE_DATABASE.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">{format(new Date(workoutDate), "M월 d일 운동", { locale: ko })}</h1>
          <Button variant="ghost" size="sm" onClick={completeWorkout}>
            완료
          </Button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Workout Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Timer className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-xs text-gray-600">운동 시간</p>
              </div>
              <div>
                <Weight className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{calculateTotalVolume()}</p>
                <p className="text-xs text-gray-600">총 볼륨 (kg)</p>
              </div>
              <div>
                <RotateCcw className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                <p className="text-lg font-bold">{isResting ? formatTime(restTimer) : "휴식 중 아님"}</p>
                <p className="text-xs text-gray-600">휴식 시간</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest Timer */}
        {isResting && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-orange-800 mb-2">휴식 중: {formatTime(restTimer)}</p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => setRestTimer(restTimer + 30)}>
                    +30초
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsResting(false)}>
                    휴식 종료
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise List */}
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onAddSet={addSet}
            onToggleComplete={toggleSetComplete}
            isActive={currentExercise?.id === exercise.id}
            onSelect={() => setCurrentExercise(exercise)}
          />
        ))}

        {/* Add Exercise Button */}
        <Dialog open={isAddingExercise} onOpenChange={setIsAddingExercise}>
          <DialogTrigger asChild>
            <Button className="w-full bg-transparent" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              운동 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>운동 선택</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="운동 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Recommended Routines */}
              <div>
                <h3 className="font-medium mb-2">추천 루틴</h3>
                <div className="space-y-2">
                  {RECOMMENDED_ROUTINES.map((routine) => (
                    <Button
                      key={routine.id}
                      variant="outline"
                      className="w-full justify-start bg-transparent"
                      onClick={() => loadRoutine(routine)}
                    >
                      {routine.name}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Individual Exercises */}
              <div>
                <h3 className="font-medium mb-2">개별 운동</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredExercises.map((exercise) => (
                    <Button
                      key={exercise.id}
                      variant="outline"
                      className="w-full justify-between bg-transparent"
                      onClick={() => addExercise(exercise)}
                    >
                      <span>{exercise.name}</span>
                      <Badge variant="secondary">{exercise.category}</Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

function ExerciseCard({
  exercise,
  onAddSet,
  onToggleComplete,
  isActive,
  onSelect,
}: {
  exercise: Exercise
  onAddSet: (exerciseId: number, weight: number, reps: number) => void
  onToggleComplete: (exerciseId: number, setIndex: number) => void
  isActive: boolean
  onSelect: () => void
}) {
  const [weight, setWeight] = useState("")
  const [reps, setReps] = useState("")

  const handleAddSet = () => {
    if (weight && reps) {
      onAddSet(exercise.id, Number.parseFloat(weight), Number.parseInt(reps))
      setWeight("")
      setReps("")
    }
  }

  return (
    <Card className={`${isActive ? "ring-2 ring-blue-500" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <button onClick={onSelect} className="text-left">
            {exercise.name}
          </button>
          <Badge variant="outline">{exercise.sets.length} 세트</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Sets */}
        {exercise.sets.map((set, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm">
              세트 {index + 1}: {set.weight}kg × {set.reps}회
            </span>
            <Button
              size="sm"
              variant={set.completed ? "default" : "outline"}
              onClick={() => onToggleComplete(exercise.id, index)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Add Set */}
        {isActive && (
          <div className="flex gap-2 pt-2 border-t">
            <Input placeholder="무게(kg)" value={weight} onChange={(e) => setWeight(e.target.value)} type="number" />
            <Input placeholder="횟수" value={reps} onChange={(e) => setReps(e.target.value)} type="number" />
            <Button onClick={handleAddSet} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
