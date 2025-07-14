"use client"

import { useState } from "react"
import { ArrowLeft, Trophy, Clock, Dumbbell, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Exercise {
  id: string
  name: string
  sets: Array<{
    id: string
    weight: number
    reps: number
    completed: boolean
  }>
}

interface WorkoutCompleteProps {
  exercises: Exercise[]
  totalTime: number
  totalVolume: number
  onBack: () => void
  onNewWorkout: () => void
}

export default function WorkoutComplete({
  exercises,
  totalTime,
  totalVolume,
  onBack,
  onNewWorkout,
}: WorkoutCompleteProps) {
  const [isGeneratingCard, setIsGeneratingCard] = useState(false)

  const completedSets = exercises.reduce(
    (total, exercise) => total + exercise.sets.filter((set) => set.completed).length,
    0,
  )

  const generateWorkoutCard = async () => {
    setIsGeneratingCard(true)

    // Canvas를 사용하여 이미지 생성
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = 800
    canvas.height = 800

    // 배경 그라데이션
    const gradient = ctx.createLinearGradient(0, 0, 800, 800)
    gradient.addColorStop(0, "#007AFF")
    gradient.addColorStop(1, "#FF9500")

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 800, 800)

    // 반투명 오버레이
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)"
    ctx.fillRect(0, 0, 800, 800)

    // 텍스트 설정
    ctx.fillStyle = "white"
    ctx.textAlign = "center"

    // 제목
    ctx.font = "bold 48px system-ui"
    ctx.fillText("오운완! 💪", 400, 120)

    // 날짜
    ctx.font = "24px system-ui"
    ctx.fillText(new Date().toLocaleDateString("ko-KR"), 400, 180)

    // 운동 통계
    ctx.font = "bold 32px system-ui"
    ctx.fillText(`총 운동 시간: ${totalTime}분`, 400, 280)
    ctx.fillText(`총 볼륨: ${totalVolume}kg`, 400, 340)
    ctx.fillText(`완료한 세트: ${completedSets}세트`, 400, 400)

    // 운동 목록
    ctx.font = "24px system-ui"
    ctx.fillText("오늘의 운동", 400, 480)

    let yPos = 520
    exercises.forEach((exercise, index) => {
      if (yPos > 650) return // 공간 제한
      const completedSetsCount = exercise.sets.filter((set) => set.completed).length
      ctx.fillText(`${exercise.name} - ${completedSetsCount}세트`, 400, yPos)
      yPos += 40
    })

    // 워터마크
    ctx.font = "18px system-ui"
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
    ctx.fillText("오운완 앱으로 기록했어요", 400, 750)

    // 이미지를 blob으로 변환
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)

        // 공유 또는 다운로드
        if (navigator.share) {
          const file = new File([blob], "workout-complete.png", { type: "image/png" })
          navigator.share({
            title: "오운완!",
            text: "오늘도 운동 완료! 💪",
            files: [file],
          })
        } else {
          // 다운로드 링크 생성
          const a = document.createElement("a")
          a.href = url
          a.download = "workout-complete.png"
          a.click()
        }

        URL.revokeObjectURL(url)
      }
      setIsGeneratingCard(false)
    }, "image/png")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">운동 완료</h1>
        </div>

        {/* 축하 메시지 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#007AFF] to-[#FF9500] rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">오늘도 해내셨군요!</h2>
          <p className="text-lg text-gray-600">정말 멋져요! 🎉</p>
        </div>

        {/* 운동 요약 */}
        <Card className="mb-6 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-center text-green-800">운동 결과 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-[#007AFF] mx-auto mb-1" />
                <p className="text-sm text-gray-600">운동 시간</p>
                <p className="font-bold text-[#007AFF]">{totalTime}분</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Dumbbell className="w-6 h-6 text-[#FF9500] mx-auto mb-1" />
                <p className="text-sm text-gray-600">총 볼륨</p>
                <p className="font-bold text-[#FF9500]">{totalVolume}kg</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-sm text-gray-600">완료 세트</p>
                <p className="font-bold text-green-600">{completedSets}세트</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 운동 상세 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">오늘의 운동</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exercises.map((exercise) => {
              const completedSetsCount = exercise.sets.filter((set) => set.completed).length
              const maxWeight = Math.max(...exercise.sets.filter((set) => set.completed).map((set) => set.weight))

              return (
                <div key={exercise.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                    <p className="text-sm text-gray-600">
                      {completedSetsCount}세트 완료
                      {maxWeight > 0 && ` • 최고 ${maxWeight}kg`}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">완료</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 액션 버튼들 */}
        <div className="space-y-3">
          <Button
            onClick={generateWorkoutCard}
            disabled={isGeneratingCard}
            className="w-full h-14 bg-gradient-to-r from-[#007AFF] to-[#FF9500] hover:from-[#0056CC] hover:to-[#E6850E] text-white font-medium text-lg"
          >
            {isGeneratingCard ? (
              <>
                <Download className="w-5 h-5 mr-2 animate-spin" />
                카드 생성 중...
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2" />
                오운완 카드로 공유하기
              </>
            )}
          </Button>

          <Button
            onClick={onNewWorkout}
            variant="outline"
            className="w-full h-12 border-[#007AFF] text-[#007AFF] hover:bg-[#007AFF]/5 bg-transparent"
          >
            새로운 운동 시작하기
          </Button>
        </div>
      </div>
    </div>
  )
}
