import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { Navbar, Footer } from './components/Navigation';
import { Home } from './pages/Home';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { About, Contact } from './pages/AboutAndContact';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';

export default function App() {
  return <SettingsProvider><CartProvider><Router><div className="min-h-screen flex flex-col bg-brand-cream text-brand-text" dir="rtl"><Navbar /><main className="flex-grow"><Routes><Route path="/" element={<Home />} /><Route path="/products/:id" element={<ProductDetail />} /><Route path="/cart" element={<CartPage />} /><Route path="/about" element={<About />} /><Route path="/contact" element={<Contact />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="*" element={<Home />} /></Routes></main><Footer /></div></Router></CartProvider></SettingsProvider>;
}
