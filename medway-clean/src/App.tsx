import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Shell from '@/components/Shell';
import BottomNav from '@/components/BottomNav';
import Home from '@/pages/Home';
import HospitalDetail from '@/pages/HospitalDetail';
import DoctorDetail from '@/pages/DoctorDetail';
import Book from '@/pages/Book';
import Confirmation from '@/pages/Confirmation';
import Queue from '@/pages/Queue';
import AINavigator from '@/pages/AINavigator';
import Compare from '@/pages/Compare';
import Emergency from '@/pages/Emergency';
import Profile from '@/pages/Profile';
import Documents from '@/pages/Documents';
import Admin from '@/pages/Admin';
import MyBookings from '@/pages/MyBookings';

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hospital/:id" element={<HospitalDetail />} />
          <Route path="/doctor/:id" element={<DoctorDetail />} />
          <Route path="/book/:hospitalId" element={<Book />} />
          <Route path="/confirmation/:appointmentId" element={<Confirmation />} />
          <Route path="/queue/:appointmentId" element={<Queue />} />
          <Route path="/ai-navigator" element={<AINavigator />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Shell>
      <BottomNav />
    </BrowserRouter>
  );
}
