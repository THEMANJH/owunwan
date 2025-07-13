"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Dumbbell, TrendingUp, UserIcon } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { getWorkoutsByDate, type WorkoutSession } from "@/lib/firestore"
import Link from "next/link"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [workoutData, setWorkoutData] = useState<WorkoutSession | null>(null)
  const [workoutDates, setWorkoutDates] = useState<Date[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        loadWorkoutDates(user.uid)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const loadWorkoutDates = async (userId: string) => {
    // 실제 구현에서는 Firestore에서 운동한 날짜들을 가져옴
    // 여기서는 예시 데이터 사용
    const dates = [new Date(2024, 0, 15), new Date(2024, 0, 17), new Date(2024, 0, 20)]
    setWorkoutDates(dates)
  }

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !user) return

    setSelectedDate(date)
    const workout = await getWorkoutsByDate(user.uid, date)
    setWorkoutData(workout)
  }

  const handleStartWorkout = () => {
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    router.push(`/workout?date=${dateStr}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
                안녕하세요, {user?.displayName || "운동러"}님! 💪
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

        {/* Selected Date Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{format(selectedDate, "M월 d일 (E)", { locale: ko })} 운동 기록</CardTitle>
          </CardHeader>
          <CardContent>
            {workoutData ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">총 운동 시간</span>
                  <Badge variant="secondary">{workoutData.totalTime}분</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">총 볼륨</span>
                  <Badge variant="secondary">{workoutData.totalVolume}kg</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">운동 종목</span>
                  <Badge variant="secondary">{workoutData.exercises.length}개</Badge>
                </div>
                <div className="pt-2">
                  <h4 className="text-sm font-medium mb-2">운동 목록:</h4>
                  <div className="space-y-1">
                    {workoutData.exercises.map((exercise, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {exercise.name} ({exercise.sets.length}세트)
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">이 날은 운동 기록이 없습니다</p>
                <Button onClick={handleStartWorkout} className="w-full">
                  <Dumbbell className="h-4 w-4 mr-2" />
                  운동 시작하기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">12</p>
                <p className="text-sm text-gray-600">이번 달 운동일</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Dumbbell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">2,450</p>
                <p className="text-sm text-gray-600">총 볼륨 (kg)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-blue-600">
              <CalendarDays className="h-5 w-5" />
              <span className="text-xs mt-1">홈</span>
            </Link>
            <Link href="/history" className="flex flex-col items-center py-2 text-gray-400">
              <TrendingUp className="h-5 w-5" />
              <span className="text-xs mt-1">기록</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400">
              <UserIcon className="h-5 w-5" />
              <span className="text-xs mt-1">프로필</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
