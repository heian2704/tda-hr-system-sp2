import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep useNavigate if it was intended to be used directly here

// Ensure these import paths are correct relative to 'src/pages/Index.tsx'
import TopBar from '../components/TopBar'; // e.g., src/components/TopBar.tsx
import LoginForm from '../app/login/components/LoginForm'; // e.g., src/pages/Index/components/LoginForm.tsx

// Define the interface for the props that LoginPage itself expects.
// It receives `setIsLoggedIn` from `App.tsx` and passes it down to `LoginForm`.
interface LoginPageProps {
  setIsLoggedIn: (value: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsLoggedIn }) => {
  // useNavigate is not strictly needed directly in LoginPage as LoginForm handles navigation after login.
  // Keeping it here as it was in your previous code.
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        {/*
          LoginForm is rendered here.
          It receives the `setIsLoggedIn` prop directly, allowing it to
          update the global authentication state upon successful login.
        */}
        <LoginForm setIsLoggedIn={setIsLoggedIn} />
      </div>
    </div>
  );
};

export default LoginPage;