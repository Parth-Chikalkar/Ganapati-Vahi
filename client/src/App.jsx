import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateBook from './pages/CreateBook';
import EditBook from './pages/EditBook';
import BookView from './pages/BookView';
import AddEntry from './pages/AddEntry';
import EditEntry from './pages/EditEntry';
import Profile from './pages/Profile';
import SharedBookView from './pages/SharedBookView';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Shared book route — standalone layout (own header/footer) */}
          <Route path="/shared/book/:shareId" element={<SharedBookView />} />

          {/* All other routes — wrapped with Navbar + Footer */}
          <Route
            path="*"
            element={
              <div className="flex flex-col min-h-screen relative overflow-hidden">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/books/:id" element={<BookView />} />

                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-book"
                      element={
                        <ProtectedRoute>
                          <CreateBook />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/books/:id/edit"
                      element={
                        <ProtectedRoute>
                          <EditBook />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/books/:bookId/add-entry"
                      element={
                        <ProtectedRoute>
                          <AddEntry />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/entries/:id/edit"
                      element={
                        <ProtectedRoute>
                          <EditEntry />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#3c2415',
              border: '1px solid #e8dcc8',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#e85d04', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#dc2f02', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
