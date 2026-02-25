import { AuthProvider } from './core/AuthContext';
import { ToastProvider } from './core/ToastContext';
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;