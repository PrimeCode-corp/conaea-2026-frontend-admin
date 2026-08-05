import { Route, Routes } from 'react-router-dom';

import PrivateRoutes from './utils/PrivateRoutes';
import useScrollToTop from './hooks/useScrollToTop';

import { useAuthInit } from '@/hooks/useAuthInit';

import Login from './pages/security/Login';
import ChangePassword from './pages/security/ChangePassword';
import AdminHome from './pages/panel/AdminHome';

import Days from './pages/panel/Days';
import ActivityType from './pages/panel/ActivityType';
import Activity from './pages/panel/Activity';
import Speaker from './pages/panel/Speaker';

import PreSale from './pages/panel/PreSale';
import QuotaType from './pages/panel/QuotaType';
import AvailableSlot from './pages/panel/AvailableSlot';

import Participant from './pages/panel/Participant';
import PartnerUniversity from './pages/panel/PartnerUniversity';
import DynamicCode from './pages/panel/DynamicCode';
import Delegates from './pages/panel/Delegates';
import IndividualCup from './pages/panel/IndividualCup';

import Partner from './pages/panel/Partner';
import Network from './pages/panel/Network';

import './App.css';

function App() {
  useScrollToTop();
  useAuthInit();

  return (
    <div className='min-h-screen m-0 p-0'>
      <Routes>
        <Route path={'/login'} element={<Login />} />

        <Route element={<PrivateRoutes />}>
          <Route path='/' element={<AdminHome />} />

          <Route path='/activity' element={<Activity />} />
          <Route path='/activity-type' element={<ActivityType />} />
          <Route path='/day' element={<Days />} />

          <Route path='/speaker' element={<Speaker />} />

          <Route path='/quota-type' element={<QuotaType />} />
          <Route path='/pre-sale' element={<PreSale />} />
          <Route path='/available-slot' element={<AvailableSlot />} />

          <Route path='/participant' element={<Participant />} />
          <Route path='/partner-university' element={<PartnerUniversity />} />
          <Route path='/dynamic-code' element={<DynamicCode />} />
          <Route path='/delegate' element={<Delegates />} />
          <Route path='/individual-cup' element={<IndividualCup />} />

          <Route path='/partner' element={<Partner />} />
          <Route path='/network' element={<Network />} />

          <Route path='/change-password' element={<ChangePassword />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
