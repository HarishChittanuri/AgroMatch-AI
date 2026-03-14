import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import LaborDashboard from './pages/LaborDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import CreateProfile from './pages/CreateProfile';
import Applications from './pages/Applications';
import JobDetails from './pages/JobDetails';
import FarmerJobs from './pages/FarmerJobs';
import FarmerApplicants from './pages/FarmerApplicants';
import EditProfile from './pages/EditProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/labor/dashboard" element={<LaborDashboard />} />
        <Route path="/labor/applications" element={<Applications />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/job/:id" element={<JobDetails />} />
        <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
        <Route path="/farmer/jobs" element={<FarmerJobs />} />
        <Route path="/farmer/jobs/:jobId/applicants" element={<FarmerApplicants />} />
        <Route path="/profile/edit" element={<EditProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;