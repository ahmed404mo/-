import { AlertTriangle, Award, Users } from 'lucide-react';

export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">نظرة عامة</h1>
      
      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* بطاقة الطلاب الخاضعين للإرشاد */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">إجمالي الطلاب</p>
            <p className="text-2xl font-bold text-gray-800">45</p>
          </div>
        </div>

        {/* بطاقة الإنذارات */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-full text-red-600">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">الإنذارات النشطة</p>
            <p className="text-2xl font-bold text-gray-800">7</p>
          </div>
        </div>

        {/* بطاقة التفوق */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-full text-green-600">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-semibold">الطلاب المتفوقين</p>
            <p className="text-2xl font-bold text-gray-800">12</p>
          </div>
        </div>

      </div>
    </div>
  );
}