import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

import LoginPage from "@/pages/Index"; 
import NotFound from "@/pages/NotFound"; // 404 page
import Layout from "@/components/Layout"; // main application layout
import Dashboard from "@/pages/dashboard/Dashboard";
import Employee from "@/pages/employee/Employee";
import WorkLog from "@/pages/worklog/WorkLog";
import Payroll from "@/pages/payroll/Payroll";
import ExpenseIncome from "@/pages/expenseincome/ExpenseIncome";
import Reports from "@/pages/reports/Reports";

const queryClient = new QueryClient();

const App = () => {
  // Initialize isLoggedIn state from localStorage.
  // This function runs only once during the initial render.
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const storedValue = localStorage.getItem('isLoggedIn');
      // localStorage stores values as strings, so we compare to the string 'true'
      return storedValue === 'true';
    } catch (error) {
      // In case localStorage is not available (e.g., in some server-side rendering environments
      // or if user privacy settings block it), default to false.
      console.error("Failed to access localStorage during initialization:", error);
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('isLoggedIn', String(isLoggedIn));
    } catch (error) {
      console.error("Failed to write to localStorage:", error);
    }
  }, [isLoggedIn]); 

  // ProtectedElement is an inline helper component.
  // It conditionally renders its children (the protected content)
  // or redirects to the login page if the user is not authenticated.
  const ProtectedElement: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/" replace />;
    }
    // If logged in, render the child components (the actual content of the protected route)
    return <>{children}</>;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/*
              Login Route:
              - This route ("/") is explicitly NOT protected. It's the entry point for authentication.
              - It renders the LoginPage component.
              - The `setIsLoggedIn` function is passed as a prop, allowing LoginForm (nested within LoginPage)
                to update the global `isLoggedIn` state upon a successful login, which then triggers the
                `useEffect` to store the session in localStorage.
            */}
            <Route path="/" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />

            {/*
              Protected Routes:
              - All routes defined from here onwards are wrapped by `ProtectedElement`.
              - `ProtectedElement` acts as a guard, ensuring only authenticated users can access these paths.
              - Each protected route renders the `Layout` component, which provides the common UI (sidebar, header).
              - `setIsLoggedIn` is also passed to `Layout` so that the "Logout" button in the sidebar
                can change the `isLoggedIn` state (and thus `localStorage`), logging the user out.
            */}

            <Route
              path="/dashboard"
              element={
                <ProtectedElement>
                  <Layout setIsLoggedIn={setIsLoggedIn}>
                    <Dashboard />
                  </Layout>
                </ProtectedElement>
              }
            />
            <Route
              path="/employee"
              element={
                <ProtectedElement>
                  <Layout setIsLoggedIn={setIsLoggedIn}>
                    <Employee />
                  </Layout>
                </ProtectedElement>
              }
            />
            <Route
              path="/worklog"
              element={
                <ProtectedElement>
                  <Layout setIsLoggedIn={setIsLoggedIn}>
                    <WorkLog />
                  </Layout>
                </ProtectedElement>
              }
            />
            <Route
              path="/payroll"
              element={
                <ProtectedElement>
                  <Layout setIsLoggedIn={setIsLoggedIn}>
                    <Payroll />
                  </Layout>
                </ProtectedElement>
              }
            />
            <Route
              path="/expense-income"
              element={
                <ProtectedElement>
                  <Layout setIsLoggedIn={setIsLoggedIn}>
                    <ExpenseIncome />
                  </Layout>
                </ProtectedElement>
              }
            />

            {/*
              Not Found Route:
              - This route ("*") acts as a catch-all for any URL that doesn't match the defined routes.
              - It's typically not protected, as its purpose is to show a "page not found" message.
            */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;