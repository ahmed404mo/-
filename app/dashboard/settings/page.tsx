import { Settings, User, Mail, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-2 md:p-8" dir="rtl">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-600" />
          إعدادات المرشد الأكاديمي
        </h1>
        <p className="text-gray-500 text-sm mt-1">إدارة بيانات حسابك وتفضيلات النظام</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden max-w-2xl">
        <div className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">المعلومات الشخصية</h2>
          
          <form className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">الاسم بالكامل</label>
              <div className="relative">
                <input type="text" defaultValue="د. أحمد محمد" disabled
                       className="w-full px-10 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600" />
                <User className="w-5 h-5 text-gray-400 absolute top-2.5 right-3" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">البريد الإلكتروني الجامعي</label>
              <div className="relative">
                <input type="email" defaultValue="advisor@cu.edu.eg" disabled
                       className="w-full px-10 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600" />
                <Mail className="w-5 h-5 text-gray-400 absolute top-2.5 right-3" />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-2">الصلاحية (Role)</label>
              <div className="relative">
                <input type="text" defaultValue="مرشد أكاديمي (ADVISOR)" disabled
                       className="w-full px-10 py-2 border border-gray-200 bg-gray-50 rounded-md text-gray-600" />
                <Shield className="w-5 h-5 text-gray-400 absolute top-2.5 right-3" />
              </div>
            </div>

            <div className="pt-4 mt-6 border-t">
              <button type="button" disabled
                      className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md opacity-50 cursor-not-allowed">
                حفظ التعديلات (غير مفعل حالياً)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}