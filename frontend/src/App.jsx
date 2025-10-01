import React, { lazy, Suspense, useState, useEffect } from 'react';
import './App.css';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import PreLoader from './components/PreLoader/PreLoader';
import { Analytics } from "@vercel/analytics/react";
import ProductPage from './pages/ProductPage';
import Doom from './components/Asteroids/Asteroids';
import PongNeon from './components/PingPong/Ping';
import Don from './components/Don/Don'
import Inviders from './components/Space/SpaceInviders';
import PointsShop from './pages/PointsShop';

const Home = lazy(() => import('./pages/Home'));
const Bought = lazy(() => import('./pages/Bought'));
const Magaz = lazy(() => import('./pages/magaz'));
const NotFoundPage = lazy(() => import('./components/NotFoundPage/NotFoundPage'));
const AIAssistantGuide = lazy(() => import('./components/NewsHero/AIAssistantGuide'));
const Society = lazy(() => import('./components/Society/Society'));
const Tech = lazy(() => import('./components/Tech/Tech'));
const Culture = lazy(() => import('./components/Culture/Culture'));
const Register = lazy(() => import('./pages/Register'));
const Log = lazy(() => import('./pages/Log'));
const Personal = lazy(() => import('./pages/Personal'));
const EditProfile = lazy(() => import('./components/EditProfile/Edit'));
const TicTacToe = lazy(() => import('./components/TicTacToe/TicTacToe'));
const Snake = lazy(() => import('./components/Snake/Snake'));
const Games = lazy(() => import('./components/Games/Games'));
const Tir = lazy(() => import('./components/Tir/Tir'));
const Urods = lazy(() => import('./components/urods/urods'));
const ChatGroup = lazy(() => import('./components/ChatGroup/ChatGroup'));
const KnowledgeMaze = lazy(() => import('./components/KnowledgeMaze/KnowledgeMaze'));
const MathBattle = lazy(() => import('./components/MathBattle/MathBattle'));
const MyTituls = lazy(() => import('./components/MyTituls/MyTituls'));
const AiChat = lazy(() => import('./components/AIChat/AiChat'));
const AiSimulation = lazy(() => import('./components/AISimulation/AISimulation'));
const AdminPanel = lazy(() => import('./components/AdminPanel/AdminPanel'));
const Leaderboard = lazy(() => import('./components/LeaderBoard/LeaderBoard'));
const Inbox = lazy(() => import('./pages/Inbox'));
const Wallet = lazy(() => import('./components/Wallet/Wallet'));
const Achievements = lazy(() => import('./components/Achievements/Achievements'));
const FriendsList = lazy(() => import('./components/FriendsList/FriendsList'));
const ChatBox = lazy(() => import('./components/ChatBox/ChatBox'));

// Leaderboard с маленькой, имя файла с Большой LeaderBoard

const App = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [purchasedItems, setPurchasedItems] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  const isNotFoundPage = ![
    "/", "/ChatGroup", "/Register", "/Login", "/MainPage",
    "/Society", "/Tech", "/Culture", "/TicTacToe", "/Snake",
    "/Games", "/Tetris", "/Tir", "/Shop", "/news", "/bought", "/KnowledgeMaze", "/MathBattle", "/don","/MyTituls","/AiChat", "/AdminPanel", "/LeaderBoard", "/Inbox", "/Wallet", "/Achievements", "/Friends", "/Chat",
    "/AISimulation","/urods"
  ].includes(location.pathname);

  return (
    <>
      {loading && <PreLoader />}
      {!isNotFoundPage && <Header />}
      <Suspense fallback={<PreLoader />}>
        <Routes>
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<AIAssistantGuide />} />
          <Route path="/Society" element={<Society />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Log />} />
          <Route path="/MainPage" element={<Personal />} />
          <Route path="/edit" element={<EditProfile />} />
          <Route path="/Tech" element={<Tech />} />
          <Route path="/Culture" element={<Culture />} />
          <Route path="/TicTacToe" element={<TicTacToe />} />
          <Route path="/Snake" element={<Snake />} />
          <Route path="/Games" element={<Games />} />
          <Route path="/Tir" element={<Tir />} />
          <Route path="/urods" element={<Urods />} />
          <Route path="/Shop" element={<Magaz />} />
          <Route path="/ChatGroup" element={<ChatGroup />} />
          <Route path="/KnowledgeMaze" element={<KnowledgeMaze/>}/>
          <Route path="/MathBattle" element={<MathBattle/>}/>
          <Route path="/bought" element={<Bought/>}/>
          <Route path= '/product/:id' element={<ProductPage/>}/>
          <Route path='/meteors' element={<Doom/>}/>
          <Route path='/pingpong' element={<PongNeon />} />
          <Route path='/don' element={ <Don/>} />
          <Route path='/MyTituls' element={ <MyTituls/>} />
          <Route path='/inviders' element={<Inviders/>}/>
          <Route path="/AiChat" element={<AiChat />} />
          <Route path="/AISimulation" element={<AiSimulation />} />
          <Route path="/AdminPanel" element={<AdminPanel />} />
          <Route path="/Points" element={<PointsShop/>}/>
          <Route path="/LeaderBoard" element={<Leaderboard/>}/>
          <Route path="/Inbox" element={<Inbox/>}/>
          <Route path="/Wallet" element={<Wallet/>}/>
          <Route path="/Achievements" element={<Achievements/>}/>
          <Route path="/Friends" element={<FriendsList/>}/>
          <Route path="/Chat/:friendId" element={<ChatBox/>}/>
        </Routes>
      </Suspense>
      {!isNotFoundPage && location.pathname !== "/ChatGroup" && <Footer />}
      <Analytics />
    </>
  );
};

export default App;
