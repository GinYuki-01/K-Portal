import React, { useState, useEffect } from 'react';
import { Clock, Calendar, BookOpen, GraduationCap, Instagram, Mail, Compass, Building, ChevronLeft, ChevronRight, Plus, X, Edit, Cloud, Sun, CloudRain, LogIn, LogOut, User } from 'lucide-react';

// Firebase認証の関数をインポート（実際のFirebase設定が必要）
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { onSnapshot } from 'firebase/firestore';







const KomazawaStudentPortal = () => {
const saveUserData = async () => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      events,
      timetable
    });
  } catch (error) {
    console.error("データ保存に失敗しました:", error);
  }
};
const loadUserData = async () => {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.events) setEvents(data.events);
      if (data.timetable) setTimetable(data.timetable);
    }
  } catch (error) {
    console.error("データ読み込みに失敗しました:", error);
  }
};


  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');
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
  const [weather, setWeather] = useState(null);
  
  // Firebase認証関連の状態
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
const [isSignUp, setIsSignUp] = useState(false); 

  // 年間スケジュール
  const yearlySchedule = {
    '2025-03-27': ['履修登録・学生証配信シール配付', '履修に関するガイダンス（動画公開開始）'],
    '2025-04-03': ['履修登録期間開始（KONECO で7日午前30分で申込可）'],
    '2025-04-10': ['履修訂正・補選設置確認期間（KONECO で18日午前3時まで訂正可）', '前期授業開始'],
    '2025-04-22': ['履修登録内容確認日'],
    '2025-04-29': ['休日授業日（祝日の日）'],
    '2025-05-14': ['前期・通年科目中間査定確認期間（KONECO で5月16日午前3時まで申請可）'],
    '2025-05-17': ['休日授業日（振りの日）'],
    '2025-07-22': ['前期授業最終日'],
    '2025-07-23': ['前期科目定期試験'],
    '2025-07-30': ['追試験受付開始'],
    '2025-08-01': ['夏季休業期間', '前期科目追試験'],
    '2025-08-12': ['全学休業期間'],
    '2025-08-21': ['前期科目成績発表（追試験科目含む）'],
    '2025-09-01': ['成績調査願受付（KONECO）'],
    '2025-09-13': ['後期科目履修訂正期間', '後期授業開始'],
    '2025-09-20': ['9月卒業式'],
    '2025-09-24': ['履修登録内容確認日'],
    '2025-10-06': ['転・編入転試験実施日', '休日授業日（スポーツの日）'],
    '2025-10-15': ['第143回開校記念日'],
    '2025-11-01': ['オータムフェスティバル（大学祭）'],
    '2025-11-24': ['休日授業日（振替休日）', '全学休業期間'],
    '2025-12-24': ['後期授業最終日'],
    '2025-12-25': ['後期・通年科目定期試験'],
    '2026-01-10': ['後期・通年科目定期試験', '追試験受付開始'],
    '2026-01-27': ['後期・通年科目追試験'],
    '2026-02-18': ['後期・通年科目成績発表'],
    '2026-03-23': ['卒業式'],
    '2026-03-27': ['2026年度履修要項・学生証配信シール配付']
  };

  // 日本の祝日（2025年）
  const holidays = {
    '2025-01-01': '元日',
    '2025-01-13': '成人の日',
    '2025-02-11': '建国記念の日',
    '2025-02-23': '天皇誕生日',
    '2025-03-20': '春分の日',
    '2025-04-29': '昭和の日',
    '2025-05-03': '憲法記念日',
    '2025-05-04': 'みどりの日',
    '2025-05-05': 'こどもの日',
    '2025-07-21': '海の日',
    '2025-08-11': '山の日',
    '2025-09-15': '敬老の日',
    '2025-09-23': '秋分の日',
    '2025-10-13': 'スポーツの日',
    '2025-11-03': '文化の日',
    '2025-11-23': '勤労感謝の日'
  };

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

  // 駒澤大学メールアドレスチェック
  const isKomazawaEmail = (email) => {
    return email.endsWith('@komazawa-u.ac.jp');
  };

useEffect(() => {
  let unsubscribeFirestore = null;

  const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      await currentUser.reload();

      if (!currentUser.emailVerified) {
        await signOut(auth);
        setUser(null);
        setAuthError('メールアドレスの確認が完了していません。確認メールのリンクをクリックしてください。');
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, 'users', currentUser.uid);
      unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.events) setEvents(data.events);
          if (data.timetable) setTimetable(data.timetable);
        }
      });
    } else {
      setUser(null);
      if (unsubscribeFirestore) unsubscribeFirestore();
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeFirestore) unsubscribeFirestore();
  };
}, []);
useEffect(() => {
  if (user) {
    saveUserData();
  }
}, [events, timetable]);

  // 天気情報取得
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // 実際のOpenWeatherMap APIを使用する場合
        // const API_KEY = '9a7f23efd0cad7fa3df276362380b756';
        // const lat = 35.6284; // 駒沢大学の緯度
        // const lon = 139.6731; // 駒沢大学の経度
        // const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`);
        // const data = await response.json();
        // setWeather(data);
        
        // デモ用のモックデータ
const API_KEY = '9a7f23efd0cad7fa3df276362380b756';
const lat = 35.6284; // 駒澤大学の緯度
const lon = 139.6731; // 駒澤大学の経度

const response = await fetch(
  `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`
);
const data = await response.json();
setWeather(data);

      } catch (error) {
        console.error('天気情報の取得に失敗しました:', error);
      }
    };

    fetchWeather();
  }, []);

  // ユーザーデータの読み込み
  useEffect(() => {
    if (user) {
      const userKey = `user_${user.uid}`;
      const savedEvents = localStorage.getItem(`${userKey}_events`);
      const savedTimetable = localStorage.getItem(`${userKey}_timetable`);
      
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents));
        } catch (e) {
          console.error('イベントデータの読み込みに失敗しました');
        }
      }
      if (savedTimetable) {
        try {
          setTimetable(JSON.parse(savedTimetable));
        } catch (e) {
          console.error('時間割データの読み込みに失敗しました');
        }
      }
    }
  }, [user]);

  // データの保存（ログイン時のみ）
  useEffect(() => {
    if (user) {
      const userKey = `user_${user.uid}`;
      localStorage.setItem(`${userKey}_events`, JSON.stringify(events));
    }
  }, [events, user]);

  useEffect(() => {
    if (user) {
      const userKey = `user_${user.uid}`;
      localStorage.setItem(`${userKey}_timetable`, JSON.stringify(timetable));
    }
  }, [timetable, user]);

  // リアルタイム時計更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

const handleLogin = async () => {
  if (!loginEmail || !loginPassword) {
    setAuthError('メールアドレスとパスワードを入力してください');
    return;
  }

  if (!loginEmail.endsWith('@komazawa-u.ac.jp')) {
    setAuthError('@komazawa-u.ac.jp のメールアドレスのみ利用できます');
    return;
  }

  setIsLoading(true);
  setAuthError('');

  try {
    if (isSignUp) {
      // 新規登録の場合
      const result = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
      await sendEmailVerification(result.user);
      
      // 新規登録後は即座にログアウトして確認を促す
      await signOut(auth);
      setUser(null);
      
      alert('確認メールを送信しました。メールのリンクをクリックしてからログインしてください。');
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
      setIsSignUp(false); // 登録後はログインモードに戻す
      
    } else {
      // ログインの場合
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      
      // ユーザー情報を再読み込みして最新の確認状態を取得
      await result.user.reload();
      
      // メール確認チェック
      if (!result.user.emailVerified) {
        await signOut(auth);
        setUser(null);
        setAuthError('メールアドレスの確認が完了していません。確認メールのリンクをクリックしてください。');
        return;
      }

      // 正常ログイン時の処理（onAuthStateChangedで自動的に処理される）
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
    }

  } catch (error) {
    let errorMessage = 'エラーが発生しました';
    
    // Firebaseエラーの日本語化
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'このメールアドレスは既に使用されています';
        break;
      case 'auth/weak-password':
        errorMessage = 'パスワードは6文字以上で入力してください';
        break;
      case 'auth/user-not-found':
        errorMessage = 'ユーザーが見つかりません';
        break;
      case 'auth/wrong-password':
        errorMessage = 'パスワードが間違っています';
        break;
      case 'auth/invalid-email':
        errorMessage = 'メールアドレスの形式が正しくありません';
        break;
      default:
        errorMessage = error.message;
    }
    
    setAuthError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};
// ログアウト処理
const handleLogout = async () => {
  try {
    await signOut(auth);
    setUser(null);
    setEvents({});
    setTimetable({});
  } catch (error) {
    console.error('ログアウトエラー:', error);
  }
};

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
    return year - 2018;
  };

  // カレンダー表示用の日付配列生成
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
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

  // 日付の年間スケジュール・祝日チェック
  const getDateInfo = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const scheduleEvents = yearlySchedule[dateStr] || [];
    const holiday = holidays[dateStr];
    return { scheduleEvents, holiday };
  };

  // イベント追加（ログイン必須）
  const addEvent = () => {
    if (!user) {
      alert('予定を保存するにはログインが必要です');
      setShowLogin(true);
      return;
    }
    
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

  // 時間割編集（ログイン必須）
  const saveTimetable = () => {
    if (!user) {
      alert('時間割を保存するにはログインが必要です');
      setShowLogin(true);
      return;
    }
    
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

  // 天気アイコン取得
  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain) {
      case 'Clear': return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'Clouds': return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'Rain': return <CloudRain className="w-6 h-6 text-blue-500" />;
      default: return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* リアルタイム時計（固定） */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg p-4 z-40">
        <div className="relative">
          {/* ログインボタンを右上に配置 */}
          <div className="absolute top-0 right-0">
            {user ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-lg">
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">{user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center space-x-1 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="text-sm">ログイン</span>
              </button>
            )}
          </div>
          
          {/* 時計を中央に配置 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600">
              {currentTime.toLocaleTimeString('ja-JP')}
            </div>
          </div>
        </div>
      </div>

{/* ログインモーダル */}
{showLogin && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{isSignUp ? '新規登録' : 'ログイン'}</h3>
        <button
          onClick={() => {
            setShowLogin(false);
            setAuthError('');
            setLoginEmail('');
            setLoginPassword('');
            setIsSignUp(false); // モーダルを閉じる時はログインモードに戻す
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>駒澤大学の学生・教職員専用</strong><br />
          @komazawa-u.ac.jp のメールアドレスでのみ{isSignUp ? '登録' : 'ログイン'}できます
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            type="email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            placeholder="example@komazawa-u.ac.jp"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="6文字以上"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        {authError && (
          <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {authError}
          </div>
        )}
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full bg-indigo-500 text-white py-3 px-4 rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
        >
          {isLoading ? '処理中...' : (isSignUp ? '登録' : 'ログイン')}
        </button>
        
        <button
          onClick={() => setIsSignUp(prev => !prev)}
          className="w-full text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
        >
          {isSignUp ? 'ログインに戻る' : '新規登録はこちら'}
        </button>
      </div>
    </div>
  </div>
)}

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
          <div className="space-y-4">
            {/* 天気情報 */}
            {weather && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
{getWeatherIcon(weather?.weather?.[0]?.main)}
                    <div>
                      <div className="font-semibold text-lg">駒沢大学周辺の天気</div>
<div className="text-gray-600">{weather?.weather?.[0]?.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{Math.round(weather?.main?.temp ?? 0)}°C</div>
                    <div className="text-sm text-gray-500">体感 {Math.round(weather?.main?.feels_like ?? 0)}°C</div>
                    <div className="text-sm text-gray-500">湿度 {weather?.main?.humidity ?? 0}%</div>
                  </div>
                </div>
              </div>
            )}

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
                  const { scheduleEvents, holiday } = getDateInfo(date);
                  const isHoliday = !!holiday;

                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedDate(date);
                        setShowEventForm(true);
                      }}
                      className={`min-h-[80px] p-1 border cursor-pointer hover:bg-gray-50 transition-colors ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                      } ${isToday ? 'ring-2 ring-indigo-500' : ''} ${
                        (isSunday || isHoliday) && isCurrentMonth ? 'text-red-500' : ''
                      }`}
                    >
                      <div className={`text-sm ${isToday ? 'font-bold' : ''} ${isHoliday ? 'text-red-600 font-semibold' : ''}`}>
                        {date.getDate()}
                      </div>
                      
                      {/* 祝日表示 */}
                      {isHoliday && (
                        <div className="text-xs bg-red-100 text-red-800 px-1 rounded mb-1 truncate">
                          {holiday}
                        </div>
                      )}
                      
                      {/* 年間スケジュール表示 */}
                      {scheduleEvents.length > 0 && (
                        <div className="space-y-1">
                          {scheduleEvents.slice(0, 1).map((event, i) => (
                            <div key={i} className="text-xs bg-blue-100 text-blue-800 px-1 rounded truncate">
                              {event}
                            </div>
                          ))}
                          {scheduleEvents.length > 1 && (
                            <div className="text-xs text-blue-500">+{scheduleEvents.length - 1}</div>
                          )}
                        </div>
                      )}
                      
                      {/* 個人予定表示 */}
                      {hasEvents && (
                        <div className="space-y-1 mt-1">
                          {events[dateKey].slice(0, 1).map((event, i) => (
                            <div key={i} className="text-xs bg-indigo-100 text-indigo-800 px-1 rounded truncate">
                              {event}
                            </div>
                          ))}
                          {events[dateKey].length > 1 && (
                            <div className="text-xs text-gray-500">+{events[dateKey].length - 1}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
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
              {/* 既存のイベント表示 */}
              {selectedDate && (() => {
                const { scheduleEvents, holiday } = getDateInfo(selectedDate);
                const dateKey = selectedDate.toDateString();
                const personalEvents = events[dateKey] || [];
                
                return (
                  <div className="mb-4 space-y-2">
                    {holiday && (
                      <div className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">
                        祝日: {holiday}
                      </div>
                    )}
                    {scheduleEvents.map((event, i) => (
                      <div key={i} className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        大学行事: {event}
                      </div>
                    ))}
                    {personalEvents.map((event, i) => (
                      <div key={i} className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                        個人予定: {event}
                      </div>
                    ))}
                  </div>
                );
              })()}
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