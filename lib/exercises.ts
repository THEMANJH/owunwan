// lib/exercises.ts

// 운동 하나의 형태를 정의합니다 (TypeScript Interface)
export interface Exercise {
    id: string;
    name: string; // 이름 (e.g., "벤치프레스")
    category: '가슴' | '등' | '하체' | '어깨' | '팔'; // 카테고리
  }
  
  // 우리 앱의 전체 운동 목록 데이터입니다.
  export const EXERCISE_LIST: Exercise[] = [
    { id: 'bench-press', name: '벤치프레스', category: '가슴' },
    { id: 'incline-press', name: '인클라인 벤치프레스', category: '가슴' },
    { id: 'dumbbell-press', name: '덤벨 프레스', category: '가슴' },
    { id: 'pull-up', name: '풀업', category: '등' },
    { id: 'barbell-row', name: '바벨 로우', category: '등' },
    { id: 'lat-pull-down', name: '랫풀다운', category: '등' },
    { id: 'squat', name: '스쿼트', category: '하체' },
    { id: 'deadlift', name: '데드리프트', category: '하체' },
    { id: 'leg-press', name: '레그 프레스', category: '하체' },
  ];