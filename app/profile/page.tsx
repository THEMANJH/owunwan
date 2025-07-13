"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Mail, Calendar, Trophy, Settings, LogOut, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ProfilePage() {
  const [user, setUser] = useState(auth.currentUser)
  const [stats, setStats] = useState({
    totalWorkouts: 45,
    totalDays: 32,
    currentStreak: 5,
    totalVolume: 28500,
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user)
      } else {
        router.push("/login")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      toast({
        title: "로그아웃 완료",
        description: "안전하게 로그아웃되었습니다",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "로그아웃 중 오류가 발생했습니다",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    const shareText = `오운완으로 ${stats.totalDays}일 동안 ${stats.totalWorkouts}번 운동했어요! 💪\n\n총 볼륨: ${stats.totalVolume.toLocaleString()}kg\n현재 연속 기록: ${stats.currentStreak}일\n\n#오운완 #운동기록 #헬스`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "내 운동 기록",
          text: shareText,
        })
      } catch (error) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "클립보드에 복사됨",
          description: "운동 기록이 클립보드에 복사되었습니다",
        })
      } catch (error) {
        toast({
          title: "공유 실패",
          description: "공유 기능을 사용할 수 없습니다",
          variant: "destructive",
        })
      }
    }
  }

  if (!user) {
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
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">프로필</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL || ""} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{user.displayName || "운동러"}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                  <Calendar className="h-4 w-4" />
                  가입일:{" "}
                  {user.metadata.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString("ko-KR")
                    : "알 수 없음"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
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

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle>달성 배지</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                🏆 첫 운동 완료
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                🔥 7일 연속 운동
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                💪 월 20회 운동
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                📈 10,000kg 볼륨 달성
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleShare} className="w-full bg-transparent" variant="outline">
            <Share2 className="h-4 w-4 mr-2" />내 기록 공유하기
          </Button>

          <Button className="w-full bg-transparent" variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            설정
          </Button>

          <Button onClick={handleSignOut} className="w-full" variant="destructive">
            <LogOut className="h-4 w-4 mr-2" />
            로그아웃
          </Button>
        </div>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-gray-500">
              <p>오운완 v1.0.0</p>
              <p className="mt-1">건강한 운동 습관을 만들어보세요</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <Link href="/" className="flex flex-col items-center py-2 text-gray-400">
              <Calendar className="h-5 w-5" />
              <span className="text-xs mt-1">홈</span>
            </Link>
            <Link href="/history" className="flex flex-col items-center py-2 text-gray-400">
              <Trophy className="h-5 w-5" />
              <span className="text-xs mt-1">기록</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center py-2 text-blue-600">
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">프로필</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
