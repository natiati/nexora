import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import { isAdmin } from './api/session';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DemoRequests from './pages/DemoRequests';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Units from './pages/Units';
import Stock from './pages/Stock';
import Warehouses from './pages/Warehouses';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Invoices from './pages/Invoices';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Company from './pages/Company';

// Páginas de administración: el servidor también las protege con requireRole('admin')
function AdminOnly({ children }) {
  return isAdmin() ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Lo primero que se ve es la landing; desde ahí "Iniciar sesión" lleva a /login */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contrasena" element={<ForgotPassword />} />
        <Route path="/restablecer-contrasena" element={<ResetPassword />} />
        <Route path="/nosotros" element={<About />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/terminos" element={<Terms />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/units" element={<Units />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/warehouses" element={<Warehouses />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/demo-requests" element={<DemoRequests />} />
          <Route path="/users" element={<AdminOnly><Users /></AdminOnly>} />
          <Route path="/roles" element={<AdminOnly><Roles /></AdminOnly>} />
          <Route path="/company" element={<AdminOnly><Company /></AdminOnly>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
