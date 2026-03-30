import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ScannerPage from './pages/ScannerPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import StatePage from './pages/StatePage';
import StatesPage from './pages/StatesPage';
import NearbyPage from './pages/NearbyPage';
import TripPlannerPage from './pages/TripPlannerPage';
import NotificationToast from './components/NotificationToast';
import { AuthProvider } from './context/AuthContext';
import { NotifProvider } from './context/NotifContext';

export default function App() {
  return (
    <AuthProvider>
      <NotifProvider>
        <BrowserRouter>
          <Navbar />
          <NotificationToast />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/scan" element={<ScannerPage />} />
            <Route path="/states" element={<StatesPage />} />
            <Route path="/nearby" element={<NearbyPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/state/:stateId" element={<StatePage />} />
          </Routes>
        </BrowserRouter>
      </NotifProvider>
    </AuthProvider>
  );
}
