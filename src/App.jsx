import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminDashboard from "./pages/AdminDashboard";
import ProductList from "./pages/ProductList";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import Coupons from "./pages/Coupons";
import Customers from "./pages/Customers";
import Reviews from "./pages/Reviews";
import Media from "./pages/Media";

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-black min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 md:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/inventory" element={<ProductList />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/media" element={<Media />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;