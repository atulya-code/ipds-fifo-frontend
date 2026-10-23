
import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { apiRequest } from "./services/api";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import StockBatches from "./pages/StockBatches";
import Challans from "./pages/Challans";
import Movements from "./pages/Movements";
import StockReceipt from "./pages/stockReceipt";
import StockBatchDetails from "./pages/StockBatchDetails";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const data = await apiRequest("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">G</div>
        <p>Loading IPDS Management...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />
        }
      />

      <Route
        path="/signup"
        element={
          user ? <Navigate to="/" replace /> : <Signup />
        }
      />

      <Route
        path="/"
        element={
          user ? (
            <Layout user={user} onLogout={() => setUser(null)} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Dashboard user={user} />} />

        <Route path="stock" element={<StockBatches user={user} />} />

        {/* QR scan se specific batch ki details open hongi */}
        <Route
          path="stock/:batchId"
          element={<StockBatchDetails user={user} />}
        />

        <Route path="challans" element={<Challans user={user} />} />
        <Route path="movements" element={<Movements />} />

        <Route
          path="stock-receipt"
          element={<StockReceipt user={user} />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
