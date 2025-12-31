'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
    const router = useRouter();
    const { user, isAuthenticated, logout, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-600">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">OmniSeller Desk</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                            {user.role === 'ADMIN' ? '👑 관리자' : '👤 사용자'}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            로그아웃
                        </button>
                    </div>
                </div>
            </header>

            {/* 메인 컨텐츠 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        환영합니다! 🎉
                    </h2>
                    <p className="text-gray-600 mb-6">
                        OmniSeller Desk에 성공적으로 로그인하셨습니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 사용자 정보 카드 */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                내 정보
                            </h3>
                            <div className="space-y-2">
                                <p className="text-gray-700">
                                    <span className="font-medium">사용자 ID:</span> {user.userId}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-medium">역할:</span> {user.role}
                                </p>
                            </div>
                        </div>

                        {/* 기능 안내 카드 */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                빠른 메뉴
                            </h3>
                            <div className="space-y-3">
                                <button
                                    onClick={() => router.push('/products')}
                                    className="w-full px-4 py-3 bg-white text-left rounded-lg hover:bg-gray-50 transition shadow-sm"
                                >
                                    <span className="text-lg mr-2">📦</span>
                                    <span className="font-medium text-gray-900">상품 관리</span>
                                </button>
                                <div className="px-4 py-2 bg-white/50 rounded-lg">
                                    <span className="text-sm text-gray-600">더 많은 기능 개발 중...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API 테스트 섹션 */}
                    <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            🔧 개발 정보
                        </h3>
                        <p className="text-gray-600 mb-4">
                            현재 JWT 토큰으로 인증된 상태입니다. 보호된 API 엔드포인트에 접근할 수 있습니다.
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <code className="text-sm text-gray-800">
                                Authorization: Bearer {localStorage.getItem('token')?.substring(0, 50)}...
                            </code>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
