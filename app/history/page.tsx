// app/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, where, getDocs, Timestamp, orderBy } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, CalendarIcon, Dumbbell } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ko } from "date-fns/locale";

// --- 데이터 타입 정의 ---
// Firestore에서 가져올 데이터의 형태를 명확하게 정의합니다.
interface WorkoutSet {
  weight: number;
  reps: number;
  completed: boolean;
}
interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}
interface WorkoutSession {
  id: string;
  createdAt: Timestamp;
  totalTime: number;
  totalVolume: number;
  exercises: WorkoutExercise[];
}

// --- 메인 컴포넌트 ---
export default function HistoryPage() {
  const router = useRouter();
  
  // --- 상태 관리 (State) ---
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [allWorkouts, setAllWorkouts] = useState<WorkoutSession[]>([]); // 모든 운동 기록 저장
  const [monthlyStats, setMonthlyStats] = useState({ totalWorkouts: 0, totalVolume: 0, totalTime: 0 });

  // --- 데이터 로직 (useEffect) ---

  // 1. 사용자의 로그인 상태를 감시합니다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. 로그인되면, 사용자의 모든 운동 기록을 Firestore에서 딱 한 번만 불러옵니다.
  useEffect(() => {
    if (user) {
      const fetchAllWorkouts = async () => {
        const q = query(collection(db, "workouts"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const workoutsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as WorkoutSession[];
        setAllWorkouts(workoutsData);
      };
      fetchAllWorkouts();
    }
  }, [user]);

  // 3. 달력이 바뀌거나, 운동 기록이 업데이트될 때마다 '월간 통계'를 다시 계산합니다.
  useEffect(() => {
    if (allWorkouts.length > 0 && selectedDate) {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      
      const monthlyWorkouts = allWorkouts.filter(workout => 
        isWithinInterval(workout.createdAt.toDate(), { start, end })
      );

      const totalVolume = monthlyWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0);
      const totalTime = monthlyWorkouts.reduce((sum, workout) => sum + workout.totalTime, 0);

      setMonthlyStats({
        totalWorkouts: monthlyWorkouts.length,
        totalVolume,
        totalTime,
      });
    }
  }, [selectedDate, allWorkouts]);


  // --- 렌더링을 위한 데이터 준비 ---

  // 운동한 날짜들만 뽑아서 달력에 표시할 용도로 만듭니다.
  const workoutDates = allWorkouts.map(w => w.createdAt.toDate());

  // 현재 선택된 날짜에 해당하는 운동 기록을 찾습니다.
  const selectedWorkout = selectedDate ? allWorkouts.find(
    (w) => format(w.createdAt.toDate(), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  ) : null;

  // 로딩 중일 때 보여줄 화면
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  // --- 최종 화면 (JSX) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">운동 기록</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* 월간 통계 카드 */}
        <Card>
            <CardHeader>
                <CardTitle className="text-base">이번 달 요약</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center"><p className="text-xl font-bold">{monthlyStats.totalWorkouts}</p><p className="text-xs text-gray-600">운동 횟수</p></div>
                    <div className="text-center"><p className="text-xl font-bold">{monthlyStats.totalVolume.toLocaleString()}</p><p className="text-xs text-gray-600">총 볼륨(kg)</p></div>
                    <div className="text-center"><p className="text-xl font-bold">{monthlyStats.totalTime}</p><p className="text-xs text-gray-600">총 시간(분)</p></div>
                </div>
            </CardContent>
        </Card>

        {/* 캘린더 */}
        <Card>
          <CardContent className="p-2 md:p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={selectedDate}
              onMonthChange={setSelectedDate}
              locale={ko}
              className="rounded-md"
              modifiers={{ workout: workoutDates }}
              modifiersStyles={{ workout: { backgroundColor: "#3b82f6", color: "white" } }}
            />
          </CardContent>
        </Card>

        {/* 선택된 날짜의 상세 기록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {selectedDate ? format(selectedDate, "M월 d일 (E)", { locale: ko }) : "날짜 선택"} 운동 기록
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWorkout ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg text-center text-sm">
                  <div><p className="font-semibold">{selectedWorkout.totalTime}분</p><p className="text-xs text-gray-500">운동 시간</p></div>
                  <div><p className="font-semibold">{selectedWorkout.totalVolume.toLocaleString()}kg</p><p className="text-xs text-gray-500">총 볼륨</p></div>
                  <div><p className="font-semibold">{selectedWorkout.exercises.length}개</p><p className="text-xs text-gray-500">운동 종목</p></div>
                </div>
                <div className="space-y-3">
                  {selectedWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="text-sm border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <h5>{exercise.name}</h5>
                        <Badge variant="outline">{exercise.sets.length} 세트</Badge>
                      </div>
                      {exercise.sets.map((set, setIndex) => (
                        <div key={setIndex} className="text-gray-600 flex justify-between pl-2">
                          <span>세트 {setIndex + 1}</span>
                          <span>{set.weight}kg × {set.reps}회</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">이 날은 운동 기록이 없습니다.</p>
                <Button asChild>
                  <Link href="/">
                    <Dumbbell className="h-4 w-4 mr-2" />
                    운동 기록하러 가기
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
