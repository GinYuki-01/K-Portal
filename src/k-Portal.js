import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, GraduationCap, Instagram, Mail, Compass, Building, ChevronLeft, ChevronRight, Plus, X, Edit } from 'lucide-react';

const KomazawaStudentPortal = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'timetable'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventText, setEventText] = useState('');
  const [timetable, setTimetable] = useState({});
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [timetableForm, setTimetableForm] = useState({
    subject: '',
    teacher: '',
    room: ''
  });

  // 時間割の時限設定
  const periods = [
    { id: 1, name: '1限', start: '09:00', end: '10:30' },
    { id: 2, name: '2限', start: '10:40', end: '12:10' },
    { id: 'lunch', name: '昼休み', start: '12:10', end: '13:00' },
    { id: 3, name: '3限', start: '13:00', end: '14:30' },
    { id: 4, name: '4限', start: '14:40', end: '16:10' },
    { id: 5, name: '5限', start: '16:20', end: '17:50' },
    { id: 6, name: '6限', start: '18:00', end: '19:30' },
    { id: 7, name: '7限', start: '19:40', end: '21:10' }
  ];

  const days = ['月', '火', '水', '木', '金', '土'];

  // リアルタイム時計更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 現在の時限を取得
  const getCurrentPeriod = () => {
    const now = currentTime;
    const timeStr = now.toTimeString().slice(0, 5);
    
    for (const period of periods) {
      if (timeStr >= period.start && timeStr <= period.end) {
        return period;
      }
    }
    return null;
  };

  // 令和年号計算
  const getReiwaYear = (year) => {
    return year - 2018; // 令和元年は2019年
  };

  // カレンダー表示用の日付配列生成
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // イベント追加
  const addEvent = () => {
    if (selectedDate && eventText.trim()) {
      const dateKey = selectedDate.toDateString();
      setEvents(prev => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] || []), eventText.trim()]
      }));
      setEventText('');
      setShowEventForm(false);
      setSelectedDate(null);
    }
  };

  // 時間割編集
  const saveTimetable = () => {
    if (editingSlot && (timetableForm.subject || timetableForm.teacher || timetableForm.room)) {
      setTimetable(prev => ({
        ...prev,
        [editingSlot]: { ...timetableForm }
      }));
      setTimetableForm({ subject: '', teacher: '', room: '' });
      setShowTimetableForm(false);
      setEditingSlot(null);
    }
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* リアルタイム時計（固定） */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg p-4 z-40">
        <div className="text-center">
          <div className="text-4xl font-bold text-indigo-600">
            {currentTime.toLocaleTimeString('ja-JP')}
          </div>
        </div>
      </div>

      {/* ヘッダー情報（スクロール可能） */}
      <div className="bg-white shadow-lg p-4 mb-4 mt-20">
        {/* 日付・時限情報 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">西暦・令和</div>
            <div className="text-lg font-semibold">
              {currentTime.getFullYear()}年・令和{getReiwaYear(currentTime.getFullYear())}年
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">今日</div>
            <div className="text-lg font-semibold">
              {currentTime.getMonth() + 1}月{currentTime.getDate()}日
            </div>
          </div>
          <div className="bg-indigo-100 p-3 rounded-lg col-span-2 md:col-span-2">
            <div className="text-sm text-indigo-600">現在の時限</div>
            <div className="text-2xl font-bold text-indigo-800">
              {currentPeriod ? currentPeriod.name : '授業時間外'}
            </div>
          </div>
        </div>

        {/* 時限一覧 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {periods.map(period => (
            <div 
              key={period.id}
              className={`p-2 rounded text-center ${
                currentPeriod?.id === period.id 
                  ? 'bg-indigo-200 text-indigo-800 font-bold' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className="font-semibold">{period.name}</div>
              <div>{period.start}-{period.end}</div>
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 px-4 pb-20">
        {/* ビュー切替 */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block mr-2" />
              カレンダー
            </button>
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === 'timetable'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4 inline-block mr-2" />
              時間割
            </button>
          </div>
        </div>

        {/* カレンダービュー */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-lg shadow-lg p-4">
            {/* カレンダーヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold">
                {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* カレンダーグリッド */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                <div key={day} className={`text-center p-2 font-semibold ${day === '日' ? 'text-red-500' : 'text-gray-700'}`}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {getCalendarDays().map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const isSunday = date.getDay() === 0;
                const dateKey = date.toDateString();
                const hasEvents = events[dateKey]?.length > 0;

                return (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedDate(date);
                      setShowEventForm(true);
                    }}
                    className={`
                      min-h-[60px] p-1 border cursor-pointer hover:bg-gray-50 transition-colors
                      ${isCurrentMonth ? 'bg-white' : 'bg-gray-100'}
                      ${isToday ? 'ring-2 ring-indigo-500' : ''}
                      ${isSunday && isCurrentMonth ? 'text-red-500' : ''}
                    `}
                  >
                    <div className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                      {date.getDate()}
                    </div>
                    {hasEvents && (
                      <div className="space-y-1">
                        {events[dateKey].slice(0, 2).map((event, i) => (
                          <div key={i} className="text-xs bg-indigo-100 text-indigo-800 px-1 rounded truncate">
                            {event}
                          </div>
                        ))}
                        {events[dateKey].length > 2 && (
                          <div className="text-xs text-gray-500">+{events[dateKey].length - 2}</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 時間割ビュー */}
        {viewMode === 'timetable' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold border-b">時限</th>
                    {days.map(day => (
                      <th key={day} className="p-3 text-center font-semibold border-b min-w-[120px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.filter(p => p.id !== 'lunch').map(period => (
                    <tr key={period.id} className="border-b">
                      <td className="p-3 bg-gray-50 font-semibold">
                        <div>{period.name}</div>
                        <div className="text-xs text-gray-600">{period.start}-{period.end}</div>
                      </td>
                      {days.map(day => {
                        const slotKey = `${day}-${period.id}`;
                        const slot = timetable[slotKey];
                        return (
                          <td
                            key={day}
                            onClick={() => {
                              setEditingSlot(slotKey);
                              setTimetableForm(slot || { subject: '', teacher: '', room: '' });
                              setShowTimetableForm(true);
                            }}
                            className="p-2 border-l cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {slot ? (
                              <div className="text-sm">
                                <div className="font-semibold text-indigo-800 mb-1">{slot.subject}</div>
                                <div className="text-gray-600">{slot.teacher}</div>
                                <div className="text-gray-500 text-xs">{slot.room}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-center">
                                <Plus className="w-4 h-4 mx-auto" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* イベント入力フォーム */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">予定を追加</h3>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setSelectedDate(null);
                  setEventText('');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {selectedDate?.toLocaleDateString('ja-JP')}
              </p>
              <input
                type="text"
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                placeholder="例: 期末試験、ゼミ発表"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addEvent}
                className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setShowEventForm(false);
                  setSelectedDate(null);
                  setEventText('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 時間割編集フォーム */}
      {showTimetableForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">時間割編集</h3>
              <button
                onClick={() => {
                  setShowTimetableForm(false);
                  setEditingSlot(null);
                  setTimetableForm({ subject: '', teacher: '', room: '' });
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">講義名</label>
                <input
                  type="text"
                  value={timetableForm.subject}
                  onChange={(e) => setTimetableForm(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="例: 基礎演習"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">講師名</label>
                <input
                  type="text"
                  value={timetableForm.teacher}
                  onChange={(e) => setTimetableForm(prev => ({ ...prev, teacher: e.target.value }))}
                  placeholder="例: 山田太郎"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">教場</label>
                <input
                  type="text"
                  value={timetableForm.room}
                  onChange={(e) => setTimetableForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="例: 0-000"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={saveTimetable}
                className="flex-1 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition-colors"
              >
                保存
              </button>
              <button
                onClick={() => {
                  if (editingSlot) {
                    setTimetable(prev => {
                      const newTimetable = { ...prev };
                      delete newTimetable[editingSlot];
                      return newTimetable;
                    });
                  }
                  setShowTimetableForm(false);
                  setEditingSlot(null);
                  setTimetableForm({ subject: '', teacher: '', room: '' });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                削除
              </button>
              <button
                onClick={() => {
                  setShowTimetableForm(false);
                  setEditingSlot(null);
                  setTimetableForm({ subject: '', teacher: '', room: '' });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 下部ナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-6 gap-1 p-2">
          <a
            href="https://koneco.komazawa-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Building className="w-6 h-6 text-indigo-600 mb-1" />
            <span className="text-xs text-gray-600">Koneco</span>
          </a>
          <a
            href="https://webclass.komazawa-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <BookOpen className="w-6 h-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-600">Webclass</span>
          </a>
          <a
            href="https://www.komazawa-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <GraduationCap className="w-6 h-6 text-blue-600 mb-1" />
            <span className="text-xs text-gray-600">大学HP</span>
          </a>
          <a
            href="https://www.instagram.com/komazawa_no_today/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Instagram className="w-6 h-6 text-pink-600 mb-1" />
            <span className="text-xs text-gray-600">Instagram</span>
          </a>
          <a
            href="https://mail.google.com/a/komazawa-u.ac.jp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Mail className="w-6 h-6 text-red-600 mb-1" />
            <span className="text-xs text-gray-600">Gmail</span>
          </a>
          <a
            href="https://wwwopac.komazawa-u.ac.jp/opac/rsv/?lang=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Compass className="w-6 h-6 text-purple-600 mb-1" />
            <span className="text-xs text-gray-600">施設予約</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default KomazawaStudentPortal;