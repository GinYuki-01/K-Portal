import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, BookOpen, GraduationCap, Instagram, Mail, Compass, Building, ChevronLeft, ChevronRight, Plus, X, Edit, Cloud, Sun, CloudRain, LogIn, LogOut, User, ExternalLink } from 'lucide-react';

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
  
  // 利用規約関連の状態
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

// 利用規約モーダルの閉じる処理
const handleTermsClose = () => {
  setShowTerms(false);
};

// 利用規約への同意処理
const handleTermsAgree = () => {
  setAgreedToTerms(true);
  setShowTerms(false);
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
        const mockWeather = {
          weather: [{ main: 'Clear', description: '晴天' }],
          main: { temp: 22, feels_like: 24, humidity: 65 }
        };
        setWeather(mockWeather);

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

  // 新規登録時は利用規約同意をチェック
  if (isSignUp && !agreedToTerms) {
    setAuthError('利用規約に同意してください');
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
      setAgreedToTerms(false); // 利用規約同意状態をリセット
      
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


const getLibraryStatus = () => {
  const now = currentTime;
  const dayOfWeek = now.getDay();
  const timeStr = now.toTimeString().slice(0, 5);

  if (dayOfWeek === 0) {
    return {
      isOpen: false,
      status: '休館日',
      hours: '日曜日は休館',
      statusColor: 'text-gray-600',
      bgColor: 'bg-gray-100'
    };
  }

  if (dayOfWeek === 6) {
    const isOpen = timeStr >= '08:30' && timeStr <= '18:00';
    return {
      isOpen,
      status: isOpen ? '開館中' : '閉館中',
      hours: '8:30-18:00',
      statusColor: isOpen ? 'text-green-600' : 'text-red-600',
      bgColor: isOpen ? 'bg-green-100' : 'bg-red-100'
    };
  }

  const isOpen = timeStr >= '08:30' && timeStr <= '21:30';
  return {
    isOpen,
    status: isOpen ? '開館中' : '閉館中',
    hours: '8:30-21:30',
    statusColor: isOpen ? 'text-green-600' : 'text-red-600',
    bgColor: isOpen ? 'bg-green-100' : 'bg-red-100'
  };
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

  // 利用規約モーダルコンポーネント（メモ化）
  const TermsModal = React.memo(({ isVisible, onClose, onAgree }) => {
    if (!isVisible) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-xl font-semibold">利用規約</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <TermsOfService />
          </div>
          
          <div className="flex justify-end gap-2 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              閉じる
            </button>
            <button
              onClick={onAgree}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
            >
              同意して閉じる
            </button>
          </div>
        </div>
      </div>
    );
  });

  // 利用規約コンポーネント（メモ化して再レンダリングを防ぐ）
  const TermsOfService = React.memo(() => (
    <div className="text-sm text-gray-700 space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">KomazawaStudentPortal 利用規約</h2>
        <p className="text-sm text-gray-600">最終更新日：2025年5月27日</p>
      </div>
      
      <p>本規約は、「KomazawaStudentPortal」（以下「本アプリ」）の利用に関する条件を定めるものです。利用者は本規約に同意のうえ、本アプリを利用するものとします。</p>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第1条（定義）</h3>
        <p>本規約において使用する用語は、次のとおりとします。</p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>「本アプリ」とは、駒澤大学の学生・教職員向けに提供されるポータルアプリケーションをいいます。</li>
          <li>「利用者」とは、本アプリを利用するすべての個人をいいます。</li>
          <li>「運営者」とは、本アプリの開発・提供・管理を行う者をいいます。</li>
        </ul>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第2条（適用範囲）</h3>
        <p>本規約は、利用者と運営者との間の本アプリに関するすべての関係に適用されます。</p>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第3条（アカウント管理）</h3>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>利用者は、@komazawa-u.ac.jp ドメインのメールアドレスを使用し、正確な情報を登録するものとします。</li>
          <li>ログイン情報は自己の責任で管理し、第三者に譲渡・貸与してはなりません。</li>
          <li>認証されたアカウントの利用により発生したすべての行為は、当該利用者の責任とみなされます。</li>
        </ol>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第4条（知的財産権）</h3>
        <p>本アプリに掲載されているコンテンツ（文章、画像、ロゴ、デザイン等）の著作権および知的財産権は、運営者または正当な権利を有する第三者に帰属します。利用者は、無断でこれらを使用、転載、複製してはなりません。</p>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第5条（禁止事項）</h3>
        <p>利用者は、以下の行為をしてはなりません。</p>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>サーバーへの過度なアクセス、連続アクセスなど、運営を妨げる行為</li>
          <li>他者のアカウントを使用またはなりすます行為</li>
          <li>本アプリを不正に解析、改ざんする行為</li>
          <li>法令または公序良俗に反する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
        </ol>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第6条（サービスの変更・中断・終了）</h3>
        <p>運営者は、事前の通知なく本アプリの内容を変更、中断または終了することがあります。これによって生じた損害について、運営者は一切の責任を負いません。</p>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第7条（免責事項）</h3>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>運営者は、本アプリの内容や提供に関して、正確性、完全性、有用性等を保証するものではありません。</li>
          <li>本アプリの利用に関連して利用者が被った損害について、運営者は一切の責任を負いません。</li>
          <li>通信障害、バグ、データ損失等による不利益についても同様です。</li>
        </ol>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第8条（個人情報の取り扱い）</h3>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>本アプリでは、Firebase Authentication によりログイン情報を管理し、ユーザーが登録する時間割・予定などの情報は、ローカルストレージまたはFirebase上に保存されます。</li>
          <li>収集された情報は、本アプリの機能提供および改善以外の目的では利用されません。</li>
          <li>本アプリはGoogle社等のサービスを利用しており、利用者は当該サービスのプライバシーポリシーにも同意したものとみなされます。</li>
        </ol>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第9条（第三者サービスの利用）</h3>
        <p>本アプリは、Firebase（Google）等の外部サービスを利用しており、利用者はそのサービスの規約・方針にも従う必要があります。</p>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">第10条（準拠法・管轄）</h3>
        <p>本規約の解釈および適用は日本法に準拠します。本アプリに関連して紛争が生じた場合、東京地方裁判所を第一審の専属的合意管轄裁判所とします。</p>
      </div>
    </div>
  ));

  const currentPeriod = getCurrentPeriod();



return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* リアルタイム時計（固定） */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-lg p-3 sm:p-4 z-40">
        <div className="relative min-h-[48px] sm:min-h-[56px]">
          {/* ログインボタンを右上に配置 */}
          <div className="absolute top-0 right-0">
            {user ? (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex items-center space-x-1 bg-green-100 px-2 sm:px-3 py-1 rounded-lg">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-green-800 truncate max-w-20 sm:max-w-none">{user.email.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">ログイン</span>
              </button>
            )}
          </div>
          
          {/* 時計を中央に配置 */}
          <div className="flex items-center justify-center h-full">
            <div className="text-3xl sm:text-4xl font-bold text-indigo-600">
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
                  setIsSignUp(false);
                  setAgreedToTerms(false);
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
              
              {/* 利用規約同意チェックボックス（新規登録時のみ） */}
              {isSignUp && (
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      id="terms-agreement"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="terms-agreement" className="text-sm text-gray-700">
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-indigo-600 hover:text-indigo-800 underline"
                      >
                        利用規約
                      </button>
                      に同意する場合はここにチェックしてください
                    </label>
                  </div>
                </div>
              )}
              
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
                onClick={() => {
                  setIsSignUp(prev => !prev);
                  setAgreedToTerms(false);
                }}
                className="w-full text-indigo-600 hover:text-indigo-800 transition-colors text-sm"
              >
                {isSignUp ? 'ログインに戻る' : '新規登録はこちら'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 利用規約モーダル */}
      <TermsModal 
        isVisible={showTerms}
        onClose={handleTermsClose}
        onAgree={handleTermsAgree}
      />

      {/* ヘッダー情報（スクロール可能） */}
      <div className="bg-white shadow-lg p-3 sm:p-4 mb-4 mt-16 sm:mt-20">
        {/* 日付・時限情報 - レスポンシブ対応 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-center">
          <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">西暦・令和</div>
            <div className="text-sm sm:text-lg font-semibold">
              <span className="block sm:inline">{currentTime.getFullYear()}年</span>
              <span className="block sm:inline sm:before:content-['・']">令和{getReiwaYear(currentTime.getFullYear())}年</span>
            </div>
          </div>
          <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">今日</div>
            <div className="text-sm sm:text-lg font-semibold">
              {currentTime.getMonth() + 1}月{currentTime.getDate()}日
            </div>
          </div>
          <div className="bg-indigo-100 p-2 sm:p-3 rounded-lg col-span-1 sm:col-span-2">
            <div className="text-xs sm:text-sm text-indigo-600">現在の時限</div>
            <div className="text-lg sm:text-2xl font-bold text-indigo-800">
              {currentPeriod ? currentPeriod.name : '授業時間外'}
            </div>
          </div>
        </div>

        {/* 時限一覧 - レスポンシブ対応 */}
        <div className="mt-3 sm:mt-4 grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1 sm:gap-2 text-xs">
          {periods.map(period => (
            <div 
              key={period.id}
              className={`p-1.5 sm:p-2 rounded text-center ${
                currentPeriod?.id === period.id 
                  ? 'bg-indigo-200 text-indigo-800 font-bold' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className="font-semibold text-xs sm:text-sm">{period.name}</div>
              <div className="text-xs">{period.start}-{period.end}</div>
            </div>
          ))}
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 px-3 sm:px-4 pb-20">
        {/* ビュー切替 */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'calendar'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4 inline-block mr-1 sm:mr-2" />
              カレンダー
            </button>
            <button
              onClick={() => setViewMode('timetable')}
              className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm ${
                viewMode === 'timetable'
                  ? 'bg-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4 inline-block mr-1 sm:mr-2" />
              時間割
            </button>
          </div>
        </div>

        {/* カレンダービュー */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            {/* 天気情報 */}
            {weather && (
              <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {getWeatherIcon(weather?.weather?.[0]?.main)}
                    <div>
                      <div className="font-semibold text-sm sm:text-lg">駒沢大学周辺の天気</div>
                      <div className="text-xs sm:text-base text-gray-600">{weather?.weather?.[0]?.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-indigo-600">{Math.round(weather?.main?.temp ?? 0)}°C</div>
                    <div className="text-xs sm:text-sm text-gray-500">体感 {Math.round(weather?.main?.feels_like ?? 0)}°C</div>
                    <div className="text-xs sm:text-sm text-gray-500">湿度 {weather?.main?.humidity ?? 0}%</div>
                  </div>
                </div>
              </div>
            )}
{/* 図書館の開館状況 */}
{(() => {
  const libStatus = getLibraryStatus();
  return (
    <div className={`rounded-lg px-3 py-2 ${libStatus.bgColor}`}>
      <div className={`text-sm font-semibold ${libStatus.statusColor}`}>
        図書館は現在：{libStatus.status}
      </div>
      <div className="text-xs text-gray-700">開館時間：{libStatus.hours}</div>
    </div>
  );
})()}

            <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4">
              {/* カレンダーヘッダー */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg sm:text-xl font-bold">
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
                  <div key={day} className={`text-center p-1 sm:p-2 font-semibold text-sm ${day === '日' ? 'text-red-500' : 'text-gray-700'}`}>
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
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
                      className={`min-h-[60px] sm:min-h-[80px] p-1 border cursor-pointer hover:bg-gray-50 transition-colors ${
                        isCurrentMonth ? 'bg-white' : 'bg-gray-100'
                      } ${isToday ? 'ring-2 ring-indigo-500' : ''} ${
                        (isSunday || isHoliday) && isCurrentMonth ? 'text-red-500' : ''
                      }`}
                    >
                      <div className={`text-xs sm:text-sm ${isToday ? 'font-bold' : ''} ${isHoliday ? 'text-red-600 font-semibold' : ''}`}>
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
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 sm:p-3 text-left font-semibold border-b text-sm">時限</th>
                    {days.map(day => (
                      <th key={day} className="p-2 sm:p-3 text-center font-semibold border-b min-w-[100px] sm:min-w-[120px] text-sm">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {periods.filter(p => p.id !== 'lunch').map(period => (
                    <tr key={period.id} className="border-b">
                      <td className="p-2 sm:p-3 bg-gray-50 font-semibold">
                        <div className="text-sm">{period.name}</div>
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
                            className="p-1.5 sm:p-2 border-l cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {slot ? (
                              <div className="text-xs sm:text-sm">
                                <div className="font-semibold text-indigo-800 mb-1 truncate">{slot.subject}</div>
                                <div className="text-gray-600 truncate">{slot.teacher}</div>
                                <div className="text-gray-500 text-xs truncate">{slot.room}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-center">
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mx-auto" />
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
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

      {/* 下部ナビゲーション - レスポンシブ対応 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg safe-area-pb">
        <div className="grid grid-cols-6 gap-0.5 sm:gap-1 p-2 sm:p-3">
          <a
            href="https://koneco.komazawa-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 mb-1" />
            <span className="text-xs text-gray-600">Koneco</span>
          </a>
          <a
            href="https://webclass.komazawa-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mb-1" />
            <span className="text-xs text-gray-600">Webclass</span>
          </a>
          <a
            href="https://www.komazawa-u.ac.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mb-1" />
            <span className="text-xs text-gray-600">大学HP</span>
          </a>
          <a
            href="https://www.instagram.com/komazawa_no_today/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 mb-1" />
            <span className="text-xs text-gray-600">Instagram</span>
          </a>
          <a
            href="https://mail.google.com/a/komazawa-u.ac.jp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mb-1" />
            <span className="text-xs text-gray-600">Gmail</span>
          </a>
          <a
            href="https://wwwopac.komazawa-u.ac.jp/opac/rsv/?lang=0"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-lg"
          >
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mb-1" />
            <span className="text-xs text-gray-600">施設予約</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default KomazawaStudentPortal;