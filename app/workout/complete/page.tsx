"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Timer, Weight, Calendar, Share2, Home } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

export default function WorkoutCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const date = searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  const time = Number.parseInt(searchParams.get("time") || "0")
  const volume = Number.parseInt(searchParams.get("volume") || "0")

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}분 ${secs}초`
  }

  const handleShare = async () => {
    const shareText = `오운완 완료! 💪\n📅 ${format(new Date(date), "M월 d일", { locale: ko })}\n⏱️ 운동시간: ${formatTime(time)}\n🏋️ 총 볼륨: ${volume}kg\n\n#오운완 #운동기록 #헬스`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "오운완 완료!",
          text: shareText,
        })
      } catch (error) {
        // 사용자가 공유를 취소한 경우
      }
    } else {
      // 클립보드에 복사
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Success Message */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-6">
            <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">운동 완료! 🎉</h1>
            <p className="text-gray-600">오늘도 멋진 운동이었습니다!</p>
          </CardContent>
        </Card>

        {/* Workout Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              운동 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">운동 날짜</span>
              <Badge variant="outline">{format(new Date(date), "M월 d일 (E)", { locale: ko })}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                운동 시간
              </span>
              <Badge variant="secondary">{formatTime(time)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2">
                <Weight className="h-4 w-4" />총 볼륨
              </span>
              <Badge variant="secondary">{volume}kg</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-blue-800 font-medium mb-2">"꾸준함이 만드는 변화"</p>
              <p className="text-blue-600 text-sm">오늘의 운동이 더 건강한 내일을 만듭니다</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button onClick={handleShare} className="w-full bg-transparent" variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            운동 기록 공유하기
          </Button>

          <Button onClick={() => router.push("/history")} className="w-full" variant="outline">
            <Calendar className="h-4 w-4 mr-2" />내 기록 달력 보기
          </Button>

          <Button onClick={() => router.push("/")} className="w-full">
            <Home className="h-4 w-4 mr-2" />
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}
