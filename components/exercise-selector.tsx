"use client"

import { useState } from "react"
import { ArrowLeft, Search, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface ExerciseSelectorProps {
  onSelect: (exerciseName: string) => void
  onBack: () => void
}

const EXERCISE_LIST = [
  { name: "벤치프레스", category: "가슴" },
  { name: "스쿼트", category: "하체" },
  { name: "데드리프트", category: "등" },
  { name: "오버헤드프레스", category: "어깨" },
  { name: "바벨로우", category: "등" },
  { name: "인클라인 벤치프레스", category: "가슴" },
  { name: "레그프레스", category: "하체" },
  { name: "풀업", category: "등" },
  { name: "딥스", category: "가슴" },
  { name: "런지", category: "하체" },
  { name: "사이드 레터럴 레이즈", category: "어깨" },
  { name: "바이셉 컬", category: "팔" },
  { name: "트라이셉 익스텐션", category: "팔" },
  { name: "플랭크", category: "코어" },
  { name: "크런치", category: "코어" },
  { name: "인클라인", category: '가슴'}
]

export default function ExerciseSelector({ onSelect, onBack }: ExerciseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredExercises = EXERCISE_LIST.filter(
    (exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) || exercise.category.includes(searchTerm),
  )

  const categories = [...new Set(EXERCISE_LIST.map((ex) => ex.category))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gray-900">운동 선택</h1>
        </div>

        {/* 검색 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="운동을 검색하세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 운동 목록 */}
        <div className="space-y-3">
          {categories.map((category) => {
            const categoryExercises = filteredExercises.filter((ex) => ex.category === category)
            if (categoryExercises.length === 0) return null

            return (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-600 mb-2 px-1">{category}</h3>
                <div className="space-y-2 mb-4">
                  {categoryExercises.map((exercise) => (
                    <Card
                      key={exercise.name}
                      className="cursor-pointer hover:shadow-md transition-shadow border-gray-200"
                      onClick={() => onSelect(exercise.name)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-[#007AFF]" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                            <p className="text-sm text-gray-500">{exercise.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}
