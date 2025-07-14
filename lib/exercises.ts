// 이 파일은 앱 전체에서 사용할 운동 목록 데이터를 정의합니다.

// 개별 운동 데이터의 형태를 정의합니다.
export interface Exercise {
    id: string;
    name: string;
    category: '가슴' | '등' | '하체' | '어깨' | '팔' | '코어';
  }
  
  // 앱에서 사용할 전체 운동 목록입니다.
  export const EXERCISE_LIST: Exercise[] = [
    { id: 'bench-press', name: '벤치프레스', category: '가슴' },
    { id: 'incline-press', name: '인클라인 벤치프레스', category: '가슴' },
    { id: 'dips', name: '딥스', category: '가슴' },
    { id: 'pull-up', name: '풀업', category: '등' },
    { id: 'barbell-row', name: '바벨 로우', category: '등' },
    { id: 'lat-pull-down', name: '랫풀다운', category: '등' },
    { id: 'squat', name: '스쿼트', category: '하체' },
    { id: 'deadlift', name: '데드리프트', category: '하체' },
    { id: 'leg-press', name: '레그 프레스', category: '하체' },
    { id: 'overhead-press', name: '오버헤드 프레스', category: '어깨' },
    { id: 'side-lateral-raise', name: '사이드 레터럴 레이즈', category: '어깨' },
    { id: 'barbell-curl', name: '바벨 컬', category: '팔' },
    { id: 'triceps-extension', name: '트라이셉스 익스텐션', category: '팔' },
    { id: 'plank', name: '플랭크', category: '코어' },
  ];
  