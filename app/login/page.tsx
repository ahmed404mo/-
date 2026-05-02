'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // تحديد المسار حسب البريد الإلكتروني
    let callbackUrl = '/dashboard';
    if (email === 'superadmin@cu.edu.eg') {
      callbackUrl = '/admin';
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: true,
      callbackUrl: callbackUrl,
    });
    
    // إذا وصلنا إلى هنا، فهناك خطأ
    setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" dir="rtl">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-2">بوابة الإرشاد الأكاديمي</h1>
          <p className="text-gray-500 text-sm">كلية التربية للطفولة المبكرة</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">البريد الإلكتروني</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="example@cu.edu.eg"
              />
              <Mail className="w-5 h-5 text-gray-400 absolute top-3.5 right-3" />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute top-3.5 right-3" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex justify-center items-center gap-2 disabled:bg-blue-400"
          >
            {loading ? (
              <span className="animate-pulse">جاري التحقق...</span>
            ) : (
              <span>تسجيل الدخول</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}