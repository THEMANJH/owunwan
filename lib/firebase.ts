// lib/firebase.ts

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 1. Firebase 콘솔에서 복사한 내 프로젝트의 설정 정보
const firebaseConfig = {
  apiKey: "AIzaSyAcbLXwbkESByPpJXwJT10HlJ0PbS90vaw",
  authDomain: "owunwan-76342.firebaseapp.com",
  projectId: "owunwan-76342",
  storageBucket: "owunwan-76342.appspot.com",
  messagingSenderId: "528656987201",
  appId: "1:528656987201:web:ec94b927f0ce49c2f502c0",
  measurementId: "G-PLWGPRE3X6"
};

// 2. Firebase 앱 초기화 (이미 초기화되었다면 기존 앱을 사용)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 3. 다른 파일에서 쓸 수 있도록 auth(인증)와 db(데이터베이스)를 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);