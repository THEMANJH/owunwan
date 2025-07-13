"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, TrendingUp, CalendarIcon, Dumbbell } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { auth } from "@/lib/firebase"
import { getWorkoutsByDate, type WorkoutSession } from "@/lib/firestore"
import Link from "next/link"

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workoutData, setWorkoutData] = useState<WorkoutSession | null>(null)
  const [workoutDates, setWorkoutDates] = useState<Date[]>([])
  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    totalTime: 0,
  })
  const router = useRouter()

  useEffect(() => {
    if (auth.currentUser) {
      loadWorkoutDates()
      loadMonthlyStats()
    }
  }, [])

  const loadWorkoutDates = async () => {
    // 실제 구현에서는 Firestore에서 운동한 날짜들을 가져옴
    const dates = [
      new Date(2024, 0, 15),
      new Date(2024, 0, 17),
      new Date(2024, 0, 20),
      new Date(2024, 0, 22),
      new Date(2024, 0, 25),
    ]
    setWorkoutDates(dates)
  }

  const loadMonthlyStats = () => {
    // 실제 구현에서는 Firestore에서 월간 통계를 계산
    setMonthlyStats({
      totalWorkouts: 12,
      totalVolume: 15420,
      totalTime: 720, // 분
    })
  }

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !auth.currentUser) return

    setSelectedDate(date)
    const workout = await getWorkoutsByDate(auth.currentUser.uid, date)
    setWorkoutData(workout)
  }

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
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <CalendarIcon className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{monthlyStats.totalWorkouts}</p>
                <p className="text-xs text-gray-600">이번 달 운동</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <Dumbbell className="h-6 w-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{monthlyStats.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-gray-600">총 볼륨 (kg)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{formatTime(monthlyStats.totalTime)}</p>
                <p className="text-xs text-gray-600">총 운동시간</p>
              </div>
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
              onSelect={handleDateSelect}
              locale={ko}
              className="rounded-md border"
              modifiers={{
                workout: workoutDates,
              }}
              modifiersStyles={{
                workout: {
                  backgroundColor: "#3b82f6",
                  color: "white",
                  fontWeight: "bold",
                },
              }}
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
            <CardTitle className="text-base">{format(selectedDate, "M월 d일 (E)", { locale: ko })} 운동 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {workoutData ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">운동 시간</p>
                    <p className="font-semibold">{Math.floor(workoutData.totalTime / 60)}분</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">총 볼륨</p>
                    <p className="font-semibold">{workoutData.totalVolume}kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">운동 종목</p>
                    <p className="font-semibold">{workoutData.exercises.length}개</p>
                  </div>
                </div>

                {/* Exercise Details */}
                <div className="space-y-3">
                  <h4 className="font-medium">운동 상세:</h4>
                  {workoutData.exercises.map((exercise, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{exercise.name}</h5>
                        <Badge variant="outline">{exercise.sets.length} 세트</Badge>
                      </div>
                      <div className="space-y-1">
                        {exercise.sets.map((set, setIndex) => (
                          <div key={setIndex} className="text-sm text-gray-600 flex justify-between">
                            <span>세트 {setIndex + 1}</span>
                            <span>
                              {set.weight}kg × {set.reps}회
                            </span>
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
                  <Link href={`/workout?date=${format(selectedDate, "yyyy-MM-dd")}`}>
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
