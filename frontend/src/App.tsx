import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Categories } from './pages/Categories';
import { Products } from './pages/Products';
import { ProductForm } from './pages/ProductForm';
import { useAuth } from './context/AuthContext';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isActive ? 'border-primary-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
    >
      {children}
    </Link>
  );
};

// Layout for authenticated pages
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center font-bold text-xl text-primary-600 mr-8">
                ProductManager
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                <NavLink to="/">Dashboard</NavLink>
                <NavLink to="/categories">Categories</NavLink>
                <NavLink to="/products">Products</NavLink>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:inline-block">Hi, {user?.name} ({user?.role})</span>
              <button 
                onClick={logout}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 w-full max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <h1 className="text-2xl font-semibold text-gray-900 text-left">Dashboard</h1>
      <p className="mt-4 text-left text-gray-600">Welcome back, {user?.name}! Head over to the specific tabs to manage records.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/edit/:id" element={<ProductForm />} />
            </Routes>
          </DashboardLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
