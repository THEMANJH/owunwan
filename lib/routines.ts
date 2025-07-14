// 이 파일은 앱 전체에서 사용할 추천 루틴 데이터를 정의합니다.

import { Exercise, EXERCISE_LIST } from './exercises';

// 추천 루틴 데이터의 형태를 정의합니다.
export interface Routine {
  id: string;
  name: string;
  creator: string;
  description: string;
  exerciseIds: string[]; // 이 루틴에 포함된 운동들의 id 목록
}

// 미리 만들어 둘 추천 루틴 목록 데이터입니다.
export const PREMADE_ROUTINES: Routine[] = [
  {
    id: 'routine-beginner-strength',
    name: '초보자 근력 강화 루틴',
    creator: '오운완 코치',
    description: '3대 운동 위주로 구성된 전신 근력 프로그램입니다.',
    exerciseIds: ['squat', 'bench-press', 'deadlift', 'overhead-press'],
  },
  {
    id: 'routine-push-day',
    name: '기본 푸시 데이 (가슴/어깨/삼두)',
    creator: '오운완 코치',
    description: '미는 날! 가슴, 어깨, 삼두를 조화롭게 발달시키는 기본 루틴입니다.',
    exerciseIds: ['bench-press', 'incline-press', 'overhead-press', 'triceps-extension'],
  },
  {
    id: 'routine-pull-day',
    name: '기본 풀 데이 (등/이두)',
    creator: '오운완 코치',
    description: '당기는 날! 등과 이두를 집중적으로 공략하는 루틴입니다.',
    exerciseIds: ['pull-up', 'barbell-row', 'lat-pull-down', 'barbell-curl'],
  },
];

// 루틴 ID를 받으면, 해당 루틴에 포함된 운동 객체 목록을 반환하는 함수입니다.
export function getExercisesForRoutine(routineId: string): Exercise[] {
  const routine = PREMADE_ROUTINES.find(r => r.id === routineId);
  if (!routine) return [];

  return routine.exerciseIds
    .map(id => EXERCISE_LIST.find(ex => ex.id === id))
    .filter((ex): ex is Exercise => !!ex); // 혹시 없는 운동 id는 걸러냅니다.
}
