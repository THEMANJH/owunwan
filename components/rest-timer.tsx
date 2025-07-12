"use client"

import { useState, useEffect } from "react"
import { Timer, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface RestTimerProps {
  onComplete: () => void
  onSkip: () => void
}

export default function RestTimer({ onComplete, onSkip }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(60)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // 타이머 완료 시 알림
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("휴식 완료!", {
          body: "다음 세트를 시작하세요.",
          icon: "/icon-192x192.png",
        })
      }
      onComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const progress = ((60 - timeLeft) / 60) * 100

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Timer className="w-12 h-12 text-[#FF9500] mx-auto mb-2" />
            <h3 className="text-lg font-bold text-gray-900">휴식 시간</h3>
            <p className="text-sm text-gray-600">다음 세트까지</p>
          </div>

          {/* 원형 프로그레스 */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" stroke="#E5E7EB" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#FF9500"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={toggleTimer} className="flex-1 bg-transparent">
              {isActive ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  일시정지
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  재시작
                </>
              )}
            </Button>
            <Button onClick={onSkip} className="flex-1 bg-[#007AFF] hover:bg-[#0056CC]">
              건너뛰기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
