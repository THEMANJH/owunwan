// app/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';

// 간단한 타입 정의
interface WorkoutLog {
  id: string;
  date: Date;
  totalVolume: number;
  exercises: any[]; // 간단하게 any 타입으로 처리
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // 로그인 상태를 감지합니다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 로그인한 사용자의 운동 기록을 불러옵니다.
  useEffect(() => {
    if (user) {
      const fetchLogs = async () => {
        const q = query(
          collection(db, "workouts"), 
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedLogs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.data().createdAt.toDate(),
          ...doc.data()
        })) as WorkoutLog[];
        setLogs(fetchedLogs);
      };
      fetchLogs();
    }
  }, [user]);

  // 달력에 운동한 날짜를 표시해주는 함수
  const tileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view === 'month') {
      const workoutDays = logs.map(log => log.date.toDateString());
      if (workoutDays.includes(date.toDateString())) {
        return <div className="workout-dot"></div>;
      }
    }
    return null;
  };

  const selectedDayLog = logs.find(log => log.date.toDateString() === selectedDate.toDateString());

  return (
    <main className="container mx-auto max-w-md p-4">
      <h1 className="text-3xl font-bold text-center my-6">나의 운동 기록</h1>
      <Calendar 
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        tileContent={tileContent}
        className="w-full"
      />
      <div className="mt-6">
        <h2 className="text-xl font-semibold">{selectedDate.toLocaleDateString("ko-KR")}</h2>
        {selectedDayLog ? (
          <div className="mt-2 p-4 border rounded-lg bg-white">
            <p>총 볼륨: {selectedDayLog.totalVolume} kg</p>
            <p>운동 종류: {selectedDayLog.exercises.map(e => e.name).join(', ')}</p>
          </div>
        ) : (
          <p className="mt-2 text-gray-500">이날은 운동 기록이 없습니다.</p>
        )}
      </div>
    </main>
  );
}