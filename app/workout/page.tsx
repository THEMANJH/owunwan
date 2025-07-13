"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarDays, Dumbbell, TrendingUp, UserIcon } from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
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
  createdAt: string;
  totalTime: number;
  totalVolume: number;
  exercises: WorkoutExercise[];
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [allWorkouts, setAllWorkouts] = useState<WorkoutSession[]>([])
  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    // 기존 코드의 totalTime을 유지하기 위해 포함
    totalTime: 0, 
  })
  const router = useRouter()

  // 1. 페이지가 처음 열릴 때, 로컬 저장소에서 모든 운동 기록을 딱 한 번만 불러옵니다.
  useEffect(() => {
    try {
      const savedWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      setAllWorkouts(savedWorkouts);
    } catch (error) {
      console.error("로컬 저장소에서 기록을 불러오는 중 오류 발생:", error);
    }
  }, []);

  // 2. 달력의 월이 바뀌거나, 운동 기록이 업데이트될 때마다 '월간 통계'를 다시 계산합니다.
  useEffect(() => {
    if (allWorkouts.length > 0) {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      
      const monthlyWorkouts = allWorkouts.filter(workout => 
        isWithinInterval(parseISO(workout.createdAt), { start, end })
      );
      const totalVolume = monthlyWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0);

      // Quick Stats 카드에 표시될 데이터를 업데이트합니다.
      setMonthlyStats(prevStats => ({
        ...prevStats,
        totalWorkouts: monthlyWorkouts.length,
        totalVolume,
      }));
    }
  }, [selectedDate, allWorkouts]);


  // 렌더링을 위한 데이터 준비
  const workoutDates = allWorkouts.map(w => parseISO(w.createdAt));
  const selectedWorkout = allWorkouts.find(
    (w) => format(parseISO(w.createdAt), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  ) || null;

  const handleStartWorkout = () => {
    // 실제 운동 기록 페이지는 메인 페이지(/)로 가정합니다.
    router.push(`/`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">오운완</h1>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="sm">
              <UserIcon className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Welcome Message */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                안녕하세요, 오운완 님! 💪
              </h2>
              <p className="text-sm text-gray-600">오늘도 건강한 하루 만들어보세요</p>
            </div>
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              운동 캘린더
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
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

        {/* Selected Date Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{format(selectedDate, "M월 d일 (E)", { locale: ko })} 운동 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWorkout ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">총 운동 시간</span><Badge variant="secondary">{selectedWorkout.totalTime}분</Badge></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">총 볼륨</span><Badge variant="secondary">{selectedWorkout.totalVolume.toLocaleString()}kg</Badge></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-600">운동 종목</span><Badge variant="secondary">{selectedWorkout.exercises.length}개</Badge></div>
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">운동 목록:</h4>
                  <div className="space-y-1">
                    {selectedWorkout.exercises.map((exercise, index) => (
                      <div key={index} className="text-sm text-gray-600">• {exercise.name} ({exercise.sets.length}세트)</div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">이 날은 운동 기록이 없습니다</p>
                <Button onClick={handleStartWorkout} className="w-full"><Dumbbell className="h-4 w-4 mr-2" />운동 시작하기</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalWorkouts}</p>
              <p className="text-sm text-gray-600">이번 달 운동일</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Dumbbell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{monthlyStats.totalVolume.toLocaleString()}</p>
              <p className="text-sm text-gray-600">총 볼륨 (kg)</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-blue-600"><CalendarDays className="h-5 w-5" /><span className="text-xs mt-1">홈</span></Link>
            <Link href="/history" className="flex flex-col items-center py-2 text-gray-400"><TrendingUp className="h-5 w-5" /><span className="text-xs mt-1">기록</span></Link>
            <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400"><UserIcon className="h-5 w-5" /><span className="text-xs mt-1">프로필</span></Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
