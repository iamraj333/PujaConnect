import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './Pages/Main Pages/Home'
import FindPandit from './Pages/Pandit/FindPandit'
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from 'react';
import GetStarted from './Pages/Main Pages/GetStarted';
import UserRegister from './Pages/User/UserRegister';
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import PanditRegister from './Pages/Pandit/PanditRegistration';
import Login from './Pages/Main Pages/Login';
import ProtectedRoute from './Components/ProtectedRoute';
import UserDashboard from './Pages/User/UserDashboard';
import AdminDashboard from './Pages/Admin/AdminDashboard';
import ManageRituals from './Pages/Admin/ManageRituals';
import VerifyPandits from './Pages/Admin/VerifyPandits';
import ManageBookings from './Pages/Admin/ManageBookings';
import ManageUsers from './Pages/Admin/ManageUsers';
import ExplorePujas from './Pages/Main Pages/ExplorePujas';
import BookPuja from './Pages/User/BookPuja';
import MyBookings from './Pages/User/MyBookings';
import PanditDashboard from './Pages/Pandit/PanditDashboard';
import MyRituals from './Pages/Pandit/MyRituals';
import ManageDisputes from './Pages/Admin/ManageDisputes';
import HowItWorks from './Pages/Main Pages/HowItWorks';
import UserSettings from './Pages/User/UserSettings';
import PanditSettings from './Pages/Pandit/PanditSettings';
import AdminSettings from './Pages/Admin/AdminSettings';
import PageNotFound from './Pages/Main Pages/PageNotFound';
import ScrollToTop from './Components/ScrollToTop';


export default function App() {
  // =========================== AOS ANIMATION ===========================================
  useEffect(() => {
    if (AOS) {
      AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: "ease-out-cubic",
      })
    }
  }, [])

  return (
    <>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path='/' element={<Home />}></Route>
          <Route path='/getStarted' element={<GetStarted />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/pujas' element={<ExplorePujas />}></Route>
          <Route path='/book-puja/:ritualId' element={<BookPuja />}></Route>
          <Route path='/how-it-works' element={<HowItWorks />}></Route>

          {/* USER ROUTES */}
          <Route path='/register' element={<UserRegister />}></Route>
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/user/settings" element={<UserSettings />} />
          </Route>


          {/* PANDIT ROUTES */}
          <Route path="/pandit/register" element={<PanditRegister />}></Route>
          <Route path='/pandits' element={<FindPandit />}></Route>
          <Route element={<ProtectedRoute allowedRoles={["pandit"]} />}>
            <Route path="/pandit/dashboard" element={<PanditDashboard />} />
            <Route path="/pandit/rituals" element={<MyRituals />} />
            <Route path="/pandit/settings" element={<PanditSettings />} />
          </Route>



          {/* ADMIN ROUTES */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/rituals" element={<ManageRituals />} />
            <Route path="/admin/pandits" element={<VerifyPandits />} />
            <Route path="/admin/bookings" element={<ManageBookings />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/disputes" element={<ManageDisputes />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>



          <Route path='*' element={<PageNotFound />}></Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
    </>
  )
}

