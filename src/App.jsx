import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage'
import ErrorToast from './components/ErrorToast'
import { useSelector } from 'react-redux'
import DashBoardPage from './pages/DashBoardPage'



function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


function App() {
  return (
    <BrowserRouter>
      <ErrorToast />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard/modules" replace />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/modules" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashBoardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
