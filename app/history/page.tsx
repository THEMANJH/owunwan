"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, CalendarIcon, Dumbbell } from "lucide-react"
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns"
import { ko } from "date-fns/locale"
import Link from "next/link"
import 'react-day-picker/dist/style.css';


// 타입 정의: 로컬 저장소에 저장될 데이터의 형태
interface WorkoutSet {
  weight: number;
  reps: number;
}
interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}
interface WorkoutSession {
  createdAt: string; // 날짜를 ISO 문자열 형태로 저장
  totalTime: number;
  totalVolume: number;
  exercises: WorkoutExercise[];
}


export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [workoutData, setWorkoutData] = useState<WorkoutSession[]>([]) // 모든 기록을 담을 배열
  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalTime: 0,
  })
  const router = useRouter()

  // 1. 페이지가 처음 열릴 때, 로컬 저장소에서 모든 운동 기록을 딱 한 번만 불러옵니다.
  useEffect(() => {
    try {
      const savedWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      setWorkoutData(savedWorkouts);
    } catch (error) {
      console.error("로컬 저장소에서 기록을 불러오는 중 오류 발생:", error);
    }
  }, []);

  // 2. 달력의 월이 바뀌거나, 운동 기록이 업데이트될 때마다 '월간 통계'를 다시 계산합니다.
  useEffect(() => {
    if (workoutData.length > 0 && selectedDate) {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      
      const monthlyWorkouts = workoutData.filter(workout => 
        isWithinInterval(parseISO(workout.createdAt), { start, end })
      );

      const totalVolume = monthlyWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0);
      const totalTime = monthlyWorkouts.reduce((sum, workout) => sum + workout.totalTime, 0);

      setMonthlyStats({
        totalWorkouts: monthlyWorkouts.length,
        totalVolume,
        totalTime,
      });
    } else {
      setMonthlyStats({ totalWorkouts: 0, totalVolume: 0, totalTime: 0 });
    }
  }, [selectedDate, workoutData]);

  // 렌더링을 위한 데이터 준비
  const workoutDates = workoutData.map(w => parseISO(w.createdAt));
  const selectedWorkout = selectedDate ? workoutData.find(
    (w) => format(parseISO(w.createdAt), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  ) : null;

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">운동 기록</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Monthly Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <CalendarIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{monthlyStats.totalWorkouts}</p>
              <p className="text-xs text-gray-600">이번 달 운동</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <Dumbbell className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{monthlyStats.totalVolume.toLocaleString()}</p>
              <p className="text-xs text-gray-600">총 볼륨 (kg)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4 text-center">
              <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <p className="text-lg font-bold text-gray-900">{formatTime(monthlyStats.totalTime)}</p>
              <p className="text-xs text-gray-600">총 운동시간</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              운동 캘린더
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={selectedDate}
              onMonthChange={setSelectedDate}
              locale={ko}
              className="rounded-md border"
              modifiers={{ workout: workoutDates }}
              modifiersStyles={{ workout: { backgroundColor: "#3b82f6", color: "white" } }}
            />
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>운동한 날</span>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{selectedDate ? format(selectedDate, "M월 d일 (E)", { locale: ko }) : ""} 운동 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWorkout ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">운동 시간</p>
                    <p className="font-semibold">{selectedWorkout.totalTime}분</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">총 볼륨</p>
                    <p className="font-semibold">{selectedWorkout.totalVolume.toLocaleString()}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">운동 종목</p>
                    <p className="font-semibold">{selectedWorkout.exercises.length}개</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">운동 상세:</h4>
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{exercise.name}</h5>
                        <Badge variant="outline">{exercise.sets.length} 세트</Badge>
                      </div>
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="text-sm text-gray-600 flex justify-between">
                            <span>세트 {setIndex + 1}</span>
                            <span>{set.weight}kg × {set.reps}회</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">이 날은 운동 기록이 없습니다</p>
                <Button asChild>
                  <Link href="/">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    운동 기록하기
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-gray-400">
              <CalendarIcon className="h-5 w-5" />
              <span className="text-xs mt-1">홈</span>
            </Link>
            <Link href="/history" className="flex flex-col items-center py-2 text-blue-600">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs mt-1">기록</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400">
              <Dumbbell className="h-5 w-5" />
              <span className="text-xs mt-1">프로필</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
