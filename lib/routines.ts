// lib/routines.ts
import { Exercise, EXERCISE_LIST } from './exercises';

// 루틴 데이터의 형태를 정의합니다.
export interface Routine {
  id: string;
  name: string; // 루틴 이름 (e.g., "김계란의 3대 헬린이 탈출 루틴")
  creator: string; // 만든 사람
  description: string; // 루틴에 대한 간단한 설명
  exerciseIds: string[]; // 이 루틴에 포함된 운동들의 id 목록
}

// 미리 만들어 둘 루틴 목록 데이터입니다.
export const PREMADE_ROUTINES: Routine[] = [
  {
    id: 'routine-001',
    name: '김계란의 3대 헬린이 탈출 루틴',
    creator: '김계란',
    description: '스쿼트, 벤치프레스, 데드리프트 위주로 구성된 초보자를 위한 근력 강화 프로그램입니다.',
    exerciseIds: ['squat', 'bench-press', 'deadlift'],
  },
  {
    id: 'routine-002',
    name: '오운완 기본 푸시 데이 (가슴/어깨/삼두)',
    creator: '오운완 앱',
    description: '미는 날! 가슴, 어깨, 삼두를 조화롭게 발달시키는 기본 루틴입니다.',
    exerciseIds: ['bench-press', 'incline-press', 'dumbbell-press'],
  },
  // 여기에 원하는 만큼 추천 루틴을 추가하세요.
];

// id 목록을 실제 운동 객체 목록으로 바꾸어주는 도우미 함수입니다.
export function getExercisesForRoutine(routineId: string): Exercise[] {
  const routine = PREMADE_ROUTINES.find(r => r.id === routineId);
  if (!routine) return [];

  return routine.exerciseIds
    .map(id => EXERCISE_LIST.find(ex => ex.id === id))
    .filter((ex): ex is Exercise => !!ex); // undefined 된 것들을 걸러줍니다.
}