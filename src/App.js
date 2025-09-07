import './App.css';
import {Routes,Route} from 'react-router-dom'
import Login from './Components/Login';
import Signup from './Components/Signup';
import ForgotPasswordPage from './Components/ForgotPasswordPage';
import PatientDashBoard from './Components/PatientDashBoard';
import FilterByDoctorPage from './Components/FilterByDoctorPage';
import DoctorSchedulePage from './Components/DoctorSchedulePage';
import PatientUpcomingEvents from './Components/PatientUpcomingEvents';
import PatientForm from './Components/PatientDemographics';
import DoctorDashboard from './Components/DoctorDashBoard';
import FilterByHospitalPage from './Components/FilterByHospital';
import PatientViewProfile from './Components/PatientProfile';
import ReceptionistDashboard from './Components/ReceptionistDashboard';
import AdminDashboard from './Components/AdminDashboard';
import DoctorForm from './Components/DoctorForm';
import HospitalForm from './Components/HospitalForm';
import ReceptionistForm from './Components/ReceptionistForm';
import PastAppointments from './Components/PastAppointments';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path = "/" element={<Login/>}></Route>
        <Route path = "/signup" element={<Signup/>}></Route>
        <Route path = "/forgot-password" element={<ForgotPasswordPage/>}></Route>
        <Route path = "/patient-dashboard" element={<PatientDashBoard/>}></Route>
        <Route path = "/filter-by-doctor" element={<FilterByDoctorPage/>}></Route>
        <Route path = "/doctor/:id/schedule" element={<DoctorSchedulePage/>}></Route>
        <Route path= "/patient-upcoming-events" element={<PatientUpcomingEvents/>}></Route>
        <Route path="/profile" element={<PatientForm/>} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard/>} />
        <Route path="/filter-by-hospital" element={<FilterByHospitalPage/>}></Route>
        <Route path="/filter-by-doctor/:id" element={<FilterByDoctorPage />} />
        <Route path="/view-profile" element={<PatientViewProfile/>}></Route>
        <Route path='/receptionist-dashboard' element={<ReceptionistDashboard/>}></Route>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/add-doctor" element={<DoctorForm />} />
        <Route path="/add-hospital" element={<HospitalForm />} />
        <Route path="/add-receptionist" element={<ReceptionistForm />} />
        <Route path="/patient-past-events" element={<PastAppointments/>} />

        {/* Add other routes as needed */}
      </Routes>
      
    </div>
  );
}

export default App;
