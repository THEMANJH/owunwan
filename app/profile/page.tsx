"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// UI 컴포넌트들은 모두 그대로 사용합니다.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Calendar as CalendarIcon, Trophy, Settings, LogOut, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// --- 데이터 타입 정의 ---
// 다른 페이지와 동일한 데이터 형태를 사용합니다.
interface WorkoutSession {
  createdAt: string;
  totalVolume: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  // --- 상태 관리 ---
  // 통계 데이터를 저장할 상태. 초기값은 0입니다.
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalDays: 0,
    currentStreak: 0, // 연속 운동일은 복잡한 계산이 필요하여 우선 0으로 둡니다.
    totalVolume: 0,
  });

  // --- 데이터 로직 ---
  // 페이지가 로드될 때 로컬 저장소에서 운동 기록을 가져와 '진짜 통계'를 계산합니다.
  useEffect(() => {
    try {
      const savedWorkouts: WorkoutSession[] = JSON.parse(localStorage.getItem('workouts') || '[]');
      
      if (savedWorkouts.length > 0) {
        // 총 운동 횟수
        const totalWorkouts = savedWorkouts.length;

        // 총 운동한 날짜 수 (중복 제거)
        const uniqueDays = new Set(savedWorkouts.map(w => w.createdAt.split('T')[0]));
        const totalDays = uniqueDays.size;

        // 총 볼륨
        const totalVolume = savedWorkouts.reduce((sum, workout) => sum + workout.totalVolume, 0);

        // 계산된 실제 통계로 상태를 업데이트합니다.
        setStats({
          totalWorkouts,
          totalDays,
          totalVolume,
          currentStreak: 5, // 우선 가짜 데이터로 유지
        });
      }
    } catch (error) {
      console.error("통계 계산 중 오류 발생:", error);
      toast({
        title: "오류",
        description: "통계 정보를 불러오는 데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [toast]); // toast를 의존성 배열에 추가합니다.


  // 공유하기 기능은 그대로 유지합니다.
  const handleShare = async () => {
    const shareText = `오운완으로 ${stats.totalDays}일 동안 ${stats.totalWorkouts}번 운동했어요! 💪\n\n총 볼륨: ${stats.totalVolume.toLocaleString()}kg\n\n#오운완 #운동기록 #헬스`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "내 운동 기록", text: shareText });
      } catch (error) { /* 사용자가 공유를 취소한 경우 무시 */ }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: "클립보드에 복사됨", description: "운동 기록이 클립보드에 복사되었습니다." });
      } catch (error) {
        toast({ title: "공유 실패", description: "공유 기능을 사용할 수 없습니다.", variant: "destructive" });
      }
    }
  };

  // --- 최종 화면 (JSX) ---
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header - 기존 기능 유지 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">프로필</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info - 로그인 정보 대신 고정된 정보를 보여줍니다. */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-user.jpg" alt="프로필 이미지" />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">오운완 님</h2>
                <p className="text-sm text-gray-600 mt-1">오늘도 최고의 하루를 만드세요!</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats - 이제 진짜 데이터가 표시됩니다. */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              운동 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.totalWorkouts}</p>
                <p className="text-sm text-gray-600">총 운동 횟수</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{stats.totalDays}</p>
                <p className="text-sm text-gray-600">운동한 날</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.currentStreak}</p>
                <p className="text-sm text-gray-600">연속 운동일</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{stats.totalVolume.toLocaleString()}</p>
                <p className="text-sm text-gray-600">총 볼륨 (kg)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements - 기존 기능 유지 */}
        <Card>
          <CardHeader><CardTitle>달성 배지</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🏆 첫 운동 완료</Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">🔥 7일 연속 운동</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">💪 월 20회 운동</Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">📈 10,000kg 볼륨 달성</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions - 로그아웃 버튼을 제거합니다. */}
        <div className="space-y-3">
          <Button onClick={handleShare} className="w-full bg-transparent" variant="outline"><Share2 className="h-4 w-4 mr-2" />내 기록 공유하기</Button>
          <Button className="w-full bg-transparent" variant="outline"><Settings className="h-4 w-4 mr-2" />설정</Button>
        </div>

        {/* App Info - 기존 기능 유지 */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>오운완 v0.1.0</p>
              <p className="mt-1">건강한 운동 습관을 만들어보세요</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation - 기존 기능 유지 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-gray-400"><CalendarIcon className="h-5 w-5" /><span className="text-xs mt-1">홈</span></Link>
            <Link href="/history" className="flex flex-col items-center py-2 text-gray-400"><Trophy className="h-5 w-5" /><span className="text-xs mt-1">기록</span></Link>
            <Link href="/profile" className="flex flex-col items-center py-2 text-blue-600"><User className="h-5 w-5" /><span className="text-xs mt-1">프로필</span></Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
