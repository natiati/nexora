import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Invoices from './pages/Invoices';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/purchases" element={<Purchases />} />
        <Route path="/invoices" element={<Invoices />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;