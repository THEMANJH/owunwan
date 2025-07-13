'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError("회원가입 실패: " + err.message);
    }
  };

  const handleLogin = async () => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError("로그인 실패: " + err.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError("구글 로그인 실패: " + err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">오운완 시작하기</CardTitle>
          <CardDescription>로그인하여 운동 기록을 안전하게 저장하세요.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm px-1">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleLogin} className="w-full">로그인</Button>
            <Button onClick={handleSignUp} variant="outline" className="w-full">회원가입</Button>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">OR</span></div>
          </div>
          <Button onClick={handleGoogleLogin} variant="outline" className="w-full">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.8 0 147 94.3 32.3 212.5 1.5c24.6-6.3 49.3-1.4 71.4 14.8l63.1 63.1C320.4 57.2 288.5 54.5 256 64.3c-50.5 15.1-90.4 49.4-110.5 98.3-20.1 48.9-10.5 102.7 28.5 142.9 39.1 40.1 94.7 54.8 145.1 42.8 45.4-10.8 79.2-46.1 94.4-90.4 15.2-44.3 8.8-93.5-20.2-132.4-15.4-20.3-35.4-35.6-58.2-45.7l-49.1-20.8c-18.5-7.8-38.6-11-58.8-9.2-34.5 3.1-66.2 19.4-89.2 46.1l-63.1-63.1c33.4-30.8 76.9-49.3 124.2-49.3 64.9 0 122.1 30.8 162.2 81.9l-63.1 63.1z"></path></svg>
            구글로 계속하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}