'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">
            OmniSeller Desk
          </h1>
          <p className="text-2xl text-white/90 mb-12 drop-shadow">
            스마트한 판매 관리 솔루션
          </p>

          <div className="flex gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              로그인
            </Link>
            <Link
              href="/register"
              className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border-2 border-white"
            >
              회원가입
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-white">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">안전한 인증</h3>
              <p className="text-white/80">JWT 기반 보안 시스템</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-white">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">실시간 대시보드</h3>
              <p className="text-white/80">판매 현황 한눈에</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl text-white">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">빠른 성능</h3>
              <p className="text-white/80">Next.js 최적화</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
