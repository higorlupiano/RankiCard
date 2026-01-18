"use client";

import { useState, useEffect, Suspense } from 'react';
import { auth, googleProvider, db } from '../lib/firebase';
// AQUI ESTAVA O PROVÁVEL ERRO: Adicionei signInWithRedirect na lista
import { signInWithRedirect, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';

function GameContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- STRAVA ---
  const [stravaConnected, setStravaConnected] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // --- GAME STATES ---
  const [totalXP, setTotalXP] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [logMsg, setLogMsg] = useState("Conectando ao servidor...");
  
  // --- TIMER STATES ---
  const [isStudying, setIsStudying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);
  const [todayStudyXP, setTodayStudyXP] = useState(0);

  // --- CONFIGURAÇÕES DE XP ---
  const XP_PER_METER_RUN = 0.27;   // Caminhada/Corrida
  const XP_PER_METER_BIKE = 0.09;  // Bike (Valendo 1/3 do esforço)
  
  const STUDY_DAILY_CAP = 1500;
  const XP_PER_MINUTE_STUDY = 7;
  const SESSION_SHORT_MIN = 25;
  const SESSION_LONG_MIN = 50;

  // 1. MONITOR DE LOGIN E STRAVA CALLBACK
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadUserData(currentUser.uid);
        
        // Verifica se voltou do site do Strava com um código
        const code = searchParams.get('code');
        if (code) {
          setLogMsg("Vinculando Strava...");
          router.replace('/');
          await handleStravaCallback(code, currentUser.uid);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [searchParams, router]);

  // 2. FUNÇÕES DE DADOS (Firebase)
  const loadUserData = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setTotalXP(data.totalXP || 0);
        setCurrentLevel(data.currentLevel || 1);
        setStravaConnected(!!data.stravaRefreshToken); // Verifica se já tem Strava
        
        // Reset diário de estudo
        const todayStr = new Date().toDateString();
        if (data.lastDate !== todayStr) {
           setTodayStudyXP(0);
           saveToCloud(uid, { lastDate: todayStr, todayStudyXP: 0 });
        } else {
           setTodayStudyXP(data.todayStudyXP || 0);
        }
        setLogMsg(`Bem-vindo, ${data.name?.split(' ')[0] || 'Herói'}!`);
      } else {
        // Primeiro acesso
        const initialData = {
          totalXP: 0,
          currentLevel: 1,
          todayStudyXP: 0,
          lastDate: new Date().toDateString(),
          name: auth.currentUser?.displayName,
          stravaLastSync: 0
        };
        await setDoc(docRef, initialData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveToCloud = async (uid: string, dataToUpdate: any) => {
    if (!uid) return;
    await setDoc(doc(db, "users", uid), dataToUpdate, { merge: true });
  };

  // 3. LÓGICA DO STRAVA
  
  // A. Botão Conectar
  const connectStrava = () => {
    const clientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_BASE_URL; 
    const scope = "activity:read_all";
    
    if (!clientId) {
      alert("Erro: Client ID não configurado no .env.local");
      return;
    }
    
    window.location.href = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;
  };

  // B. Botão Desvincular
  const disconnectStrava = async () => {
    if (!user) return;
    if (!confirm("Tem certeza que deseja desvincular o Strava?")) return;

    setLogMsg("Desvinculando...");
    try {
        await saveToCloud(user.uid, {
            stravaRefreshToken: deleteField(),
            stravaAccessToken: deleteField(),
            stravaExpiresAt: deleteField(),
            stravaLastSync: deleteField()
        });
        setStravaConnected(false);
        setSyncMsg("");
        setLogMsg("Strava desconectado.");
    } catch (error) {
        console.error(error);
        setLogMsg("Erro ao desconectar.");
    }
  };

  // C. Callback e Sync
  const handleStravaCallback = async (code: string, uid: string) => {
    try {
      const res = await fetch('/api/strava', {
        method: 'POST',
        body: JSON.stringify({ code }),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (data.refresh_token) {
        await saveToCloud(uid, { 
            stravaRefreshToken: data.refresh_token,
            stravaAccessToken: data.access_token,
            stravaExpiresAt: data.expires_at
        });
        setStravaConnected(true);
        setLogMsg("✅ Strava Conectado!");
      } else {
        setLogMsg("Erro na resposta do Strava.");
      }
    } catch (err) {
      console.error(err);
      setLogMsg("Erro de conexão com Strava.");
    }
  };

  const syncStravaActivities = async () => {
    if (!user) return;
    setSyncMsg("⏳ Buscando atividades...");
    
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      const userData = docSnap.data();
      
      if (!userData?.stravaRefreshToken) return;

      const tokenRes = await fetch('/api/strava', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: userData.stravaRefreshToken }),
      });
      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        setSyncMsg("Erro ao renovar token.");
        return;
      }

      const lastSync = userData.stravaLastSync || 0;
      const activitiesRes = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${lastSync}&per_page=30`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const activities = await activitiesRes.json();

      if (!Array.isArray(activities) || activities.length === 0) {
        setSyncMsg("Nenhuma atividade nova.");
        return;
      }

      // --- CÁLCULO DE XP (Com Anti-Cheat) ---
      let totalXpGained = 0;
      let newActivitiesCount = 0;
      let latestDate = lastSync;
      let manualActivitiesIgnored = 0;

      activities.forEach((act: any) => {
        // IGNORA MANUAL (Anti-Cheat)
        if (act.manual) {
            manualActivitiesIgnored++;
            const actDate = new Date(act.start_date).getTime() / 1000;
            if (actDate > latestDate) latestDate = actDate;
            return; 
        }

        let xpForThis = 0;
        if (['Run', 'Walk', 'Hike'].includes(act.type)) {
            xpForThis = Math.floor(act.distance * XP_PER_METER_RUN);
        }
        else if (['Ride', 'VirtualRide', 'EBikeRide'].includes(act.type)) {
            xpForThis = Math.floor(act.distance * XP_PER_METER_BIKE);
        }

        if (xpForThis > 0) {
            totalXpGained += xpForThis;
            newActivitiesCount++;
        }

        const actDate = new Date(act.start_date).getTime() / 1000;
        if (actDate > latestDate) latestDate = actDate;
      });

      await saveToCloud(user.uid, { stravaLastSync: latestDate });

      if (totalXpGained > 0) {
        processXP(totalXpGained, `Strava (${newActivitiesCount} atividades)`);
        setSyncMsg(`🔥 +${totalXpGained} XP Sincronizados!`);
      } else if (manualActivitiesIgnored > 0) {
        setSyncMsg(`⚠️ Atividades manuais ignoradas.`);
      } else {
        setSyncMsg("Atividades ignoradas (Sem XP elegível).");
      }

    } catch (err) {
      console.error(err);
      setSyncMsg("Erro na sincronização.");
    }
  };


  // --- FUNÇÕES AUXILIARES ---
  
  // MUDANÇA IMPORTANTE: LOGIN COM REDIRECT
  const handleLogin = async () => { 
    try {
        await signInWithRedirect(auth, googleProvider); 
    } catch (error) {
        console.error("Erro Login:", error);
        alert("Erro ao iniciar login.");
    }
  };

  const handleLogout = async () => { await signOut(auth); window.location.reload(); };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStudying && timeLeft > 0) {
      interval = setInterval(() => { setTimeLeft((prev) => prev - 1); }, 1000);
    } else if (isStudying && timeLeft === 0) { completeStudySession(); }
    return () => clearInterval(interval);
  }, [isStudying, timeLeft]);

  const getXpForNextLevel = (level: number) => 50 * (level * level);
  const getRank = (level: number) => {
    if (level >= 65) return 'S'; if (level >= 50) return 'A'; if (level >= 40) return 'B';
    if (level >= 30) return 'C'; if (level >= 20) return 'D'; if (level >= 10) return 'E'; return 'F';
  };
  const getTitle = (level: number) => {
    if (level >= 65) return "Lendário"; if (level >= 50) return "Mestre"; if (level >= 40) return "Elite";
    if (level >= 30) return "Veterano"; if (level >= 20) return "Confirmado"; if (level >= 10) return "Aprendiz"; return "Novato";
  };

  const processXP = (amount: number, source: string) => {
    if (!user) return;
    const newTotalXP = totalXP + amount;
    let tempLevel = currentLevel;
    let xpNext = getXpForNextLevel(tempLevel);
    while (newTotalXP >= xpNext) {
      tempLevel++; xpNext = getXpForNextLevel(tempLevel);
    }
    setTotalXP(newTotalXP); setCurrentLevel(tempLevel);
    saveToCloud(user.uid, { totalXP: newTotalXP, currentLevel: tempLevel });
    setLogMsg(`+${amount} XP (${source})`);
  };

  const startStudySession = (minutes: number) => {
    const potentialXP = minutes * XP_PER_MINUTE_STUDY;
    if (todayStudyXP + potentialXP > STUDY_DAILY_CAP) { alert("🛑 Limite diário atingido."); return; }
    setSessionXP(potentialXP); setTimeLeft(minutes * 60); setIsStudying(true);
  };
  const completeStudySession = () => {
    setIsStudying(false);
    if (!user) return;
    const newTodayXP = todayStudyXP + sessionXP;
    setTodayStudyXP(newTodayXP);
    saveToCloud(user.uid, { todayStudyXP: newTodayXP });
    processXP(sessionXP, "Estudos");
  };
  const cancelStudy = () => { setIsStudying(false); setTimeLeft(0); };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const rankColors: Record<string, string> = { 'F': '#333', 'E': '#cd7f32', 'D': '#7f8c8d', 'C': '#f1c40f', 'B': '#2980b9', 'A': '#8b0000', 'S': '#8b0000' };
  
  if (loading) return <div className="flex h-screen items-center justify-center text-white">Carregando Guilda...</div>;
  if (!user) return (
      <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#1a1a1a]">
        <h1 className="text-4xl font-bold mb-8 text-[#c5a059] font-serif">RPG LIFE</h1>
        <button onClick={handleLogin} className="bg-blue-600 text-white py-3 px-6 rounded font-bold hover:bg-blue-700">Entrar com Google</button>
      </main>
  );

  const xpForNext = getXpForNextLevel(currentLevel); const xpForCurrent = getXpForNextLevel(currentLevel - 1);
  const xpInLevel = totalXP - xpForCurrent; const xpRequired = xpForNext - xpForCurrent;
  const percent = Math.min(100, Math.max(0, (xpInLevel / xpRequired) * 100));
  const rank = getRank(currentLevel); const title = getTitle(currentLevel);

  return (
    <main className="flex flex-col items-center gap-8 pb-20 pt-10">
      <button onClick={handleLogout} className="absolute top-4 right-4 text-xs text-gray-500 underline">Sair</button>

      {/* CARTÃO DO AVENTUREIRO */}
      <div className="guild-card">
        <div className="left-panel">
          <div className="header-section">
            <div className="guild-header">{title} - Rank {rank}</div>
            <div className="char-name">{user.displayName?.split(' ')[0]}</div>
            <div style={{ fontSize: '10px', marginTop: '5px', color: '#555' }}>ID: {user.uid.slice(0,8)}...</div>
          </div>
          <div className="stats-grid">
             <div className="stat-box"><div className="stat-label">Nível</div><div className="stat-value">{currentLevel}</div></div>
             <div className="stat-box"><div className="stat-label">XP Total</div><div className="stat-value">{Math.floor(totalXP)}</div></div>
             <div className="stat-box"><div className="stat-label">Fadiga</div><div className="stat-value" style={{fontSize:'12px'}}>{todayStudyXP}/{STUDY_DAILY_CAP}</div></div>
          </div>
          <div className="xp-section">
            <div className="xp-bar-frame"><div className="xp-fill" style={{ width: `${percent}%` }}></div></div>
          </div>
        </div>
        <div className="right-panel">
          <div className="char-portrait" style={{ backgroundImage: `url('${user.photoURL || '/avatar.jpg'}')` }}></div>
          <div className="rank-circle" style={{ borderColor: rankColors[rank], color: rankColors[rank] }}>{rank}</div>
        </div>
      </div>

      <div className="flex gap-5 flex-wrap justify-center w-full max-w-[700px] px-4">
          
          {/* PAINEL FÍSICO (AGORA COM STRAVA) */}
          <div className="controls-panel shadow-lg flex-1 min-w-[300px] bg-orange-50 border-orange-500 border-l-4">
            <h3 className="font-bold mb-3 text-lg border-b border-orange-200 pb-2 text-orange-800">🏃‍♂️ Strava Sync</h3>
            
            {!stravaConnected ? (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-4">Conecte sua conta para importar corridas automaticamente.</p>
                    <button 
                        onClick={connectStrava}
                        className="w-full bg-[#FC4C02] text-white py-2 rounded font-bold hover:bg-orange-700 transition"
                    >
                        Conectar ao Strava
                    </button>
                </div>
            ) : (
                <div className="text-center">
                     <p className="text-xs text-green-700 font-bold mb-3">✅ Conta Vinculada</p>
                     <button 
                        onClick={syncStravaActivities}
                        className="w-full bg-[#2c241b] text-white py-3 rounded font-bold hover:bg-[#4a3b2a] transition flex items-center justify-center gap-2"
                     >
                        🔄 Sincronizar Atividades
                     </button>
                     <p className="text-[10px] text-gray-500 mt-2">{syncMsg}</p>

                     <button 
                        onClick={disconnectStrava}
                        className="text-[10px] text-red-500 hover:text-red-700 underline mt-4"
                     >
                        Desvincular Strava
                     </button>
                </div>
            )}
          </div>

          {/* PAINEL MENTAL */}
          <div className="controls-panel shadow-lg border-l-4 border-blue-600 flex-1 min-w-[300px]">
            <h3 className="font-bold mb-3 text-lg border-b pb-2 text-blue-900">🧠 Treino Mental</h3>
            {!isStudying ? (
                <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <button onClick={() => startStudySession(SESSION_SHORT_MIN)} className="flex-1 bg-blue-600 text-white py-2 rounded font-bold text-sm">25 Min</button>
                        <button onClick={() => startStudySession(SESSION_LONG_MIN)} className="flex-1 bg-indigo-600 text-white py-2 rounded font-bold text-sm">50 Min</button>
                    </div>
                </div>
            ) : (
                <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-blue-600 mb-2">{formatTime(timeLeft)}</div>
                    <button onClick={cancelStudy} className="w-full bg-red-100 text-red-600 border border-red-200 py-1 rounded text-sm font-bold">Desistir</button>
                </div>
            )}
          </div>
      </div>

      <div className="text-center w-full max-w-[600px] px-4">
        <div className="bg-black/80 text-green-400 p-2 rounded font-mono text-sm min-h-[40px] flex items-center justify-center border border-gray-700">
            {logMsg}
        </div>
      </div>
    </main>
  );
}

// O componente Home agora só "embalar" o conteúdo para evitar erros do Next.js
export default function Home() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20">Carregando...</div>}>
      <GameContent />
    </Suspense>
  );
}