"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User as UserIcon, CalendarDays, Dumbbell, TrendingUp } from "lucide-react"
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns"
import { ko } from "date-fns/locale"
import 'react-day-picker/dist/style.css';


// --- 데이터 타입 정의 ---
// 로컬 저장소에 저장될 데이터의 형태를 명확하게 정의합니다.
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


export default function HomePage() {
  const [name, setName] = useState("오운완 님");
  useEffect(() => {
    const saved = localStorage.getItem("userName");
    if (saved) setName(saved);
  }, []);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [allWorkouts, setAllWorkouts] = useState<WorkoutSession[]>([]); // 모든 기록을 담을 배열
  const [monthlyStats, setMonthlyStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
  });
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [editWorkout, setEditWorkout] = useState<WorkoutSession | null>(null);


  // --- 데이터 로직 ---
  // 1. 페이지가 처음 열릴 때, 로컬 저장소에서 모든 운동 기록을 딱 한 번만 불러옵니다.
  useEffect(() => {
    try {
      const savedWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      setAllWorkouts(savedWorkouts);
    } catch (error) {
      console.error("로컬 저장소에서 기록을 불러오는 중 오류 발생:", error);
    }
    setLoading(false);
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

      setMonthlyStats({
        totalWorkouts: monthlyWorkouts.length,
        totalVolume,
      });
    }
  }, [selectedDate, allWorkouts]);

  // --- 렌더링을 위한 데이터 준비 ---
  const workoutDates = allWorkouts.map(w => parseISO(w.createdAt));
  const selectedWorkout = allWorkouts.find(
    (w) => format(parseISO(w.createdAt), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  ) || null;

  const handleStartWorkout = () => {
    // 운동 기록 페이지로 이동하는 로직은 그대로 유지합니다.
    // 이 부분은 당신의 운동 기록 페이지 (예: /workout)가 구현되어야 합니다.
    // 지금은 메인 페이지로 이동하도록 설정합니다.
    router.push("/workout");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {editMode && editWorkout && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">운동 기록 수정</h3>
            {editWorkout.exercises.map((ex, i) => (
              <div key={i} className="mb-2">
                <div className="font-semibold">{ex.name}</div>
                {ex.sets.map((set, j) => (
                  <div key={j} className="flex gap-2 mb-1">
                    <input
                      type="number"
                      value={set.weight}
                      onChange={e => {
                        const newWeight = Number(e.target.value);
                        setEditWorkout(prev => {
                          if (!prev) return prev;
                          const copy = { ...prev };
                          copy.exercises = copy.exercises.map((e, ei) =>
                            ei === i
                              ? {
                                ...e,
                                sets: e.sets.map((s, si) =>
                                  si === j ? { ...s, weight: newWeight } : s
                                ),
                              }
                              : e
                          );
                          return copy;
                        });
                      }}
                      className="border w-16 px-2"
                    />
                    <input
                      type="number"
                      value={set.reps}
                      onChange={e => {
                        const newReps = Number(e.target.value);
                        setEditWorkout(prev => {
                          if (!prev) return prev;
                          const copy = { ...prev };
                          copy.exercises = copy.exercises.map((e, ei) =>
                            ei === i
                              ? {
                                ...e,
                                sets: e.sets.map((s, si) =>
                                  si === j ? { ...s, reps: newReps } : s
                                ),
                              }
                              : e
                          );
                          return copy;
                        });
                      }}
                      className="border w-16 px-2"
                    />
                    <span className="text-xs text-gray-400">kg / reps</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button
                className="bg-blue-600 text-white rounded px-4 py-2"
                onClick={() => {
                  // 저장: localStorage에 반영
                  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
                  const idx = workouts.findIndex((w: WorkoutSession) =>
                    w.createdAt === editWorkout.createdAt
                  );
                  if (idx >= 0) {
                    workouts[idx] = editWorkout;
                    localStorage.setItem('workouts', JSON.stringify(workouts));
                  }
                  setEditMode(false);
                  window.location.reload(); // 새로고침해서 반영
                }}
              >
                저장
              </button>
              <button className="text-gray-500 px-4 py-2" onClick={() => setEditMode(false)}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
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
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              안녕하세요, {name} 님! 💪
            </h2>
            <p className="text-sm text-gray-600">오늘도 건강한 하루 만들어보세요</p>
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
              className="shadow-sm"
              modifiers={{ workout: workoutDates }}
              modifiersClassNames={{ workout: "rdp-day_workout" }}
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
    <CardTitle className="text-base">
      {format(selectedDate, "M월 d일 (E)", { locale: ko })} 운동 기록
    </CardTitle>
  </CardHeader>
  <CardContent>
    {selectedWorkout ? (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">총 운동 시간</span>
          <Badge variant="secondary">{selectedWorkout.totalTime}분</Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">총 볼륨</span>
          <Badge variant="secondary">
            {selectedWorkout.totalVolume.toLocaleString()}kg
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">운동 종목</span>
          <Badge variant="secondary">
            {selectedWorkout.exercises.length}개
          </Badge>
        </div>
        <div className="pt-2">
          <h4 className="text-sm font-medium mb-2">운동 목록:</h4>
          <div className="space-y-1">
            {selectedWorkout.exercises.map((exercise, index) => (
              <div key={index} className="text-sm text-gray-600">
                • {exercise.name} ({exercise.sets.length}세트)
              </div>
            ))}
          </div>
        </div>
        <Button
          className="w-full mt-3"
          onClick={() => {
            setEditWorkout({ ...selectedWorkout });
            setEditMode(true);
          }}
        >
          운동 기록 수정하기
        </Button>
      </div>
    ) : (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 mb-4">
          이 날은 운동 기록이 없습니다
        </p>
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
            <p className="text-sm text-gray-600">이번 달 총 볼륨 (kg)</p>
          </CardContent>
        </Card>
      </div>
    </div>

      {/* Bottom Navigation */ }
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
    <div className="max-w-md mx-auto px-4 py-2">
      <div className="flex justify-around">
        <Link href="/" className="flex flex-col items-center py-2 text-blue-600"><CalendarDays className="h-5 w-5" /><span className="text-xs mt-1">홈</span></Link>
        <Link href="/history" className="flex flex-col items-center py-2 text-gray-400"><TrendingUp className="h-5 w-5" /><span className="text-xs mt-1">기록</span></Link>
        <Link href="/profile" className="flex flex-col items-center py-2 text-gray-400"><UserIcon className="h-5 w-5" /><span className="text-xs mt-1">프로필</span></Link>
      </div>
    </div>
  </nav>
    </div >
  )
}
