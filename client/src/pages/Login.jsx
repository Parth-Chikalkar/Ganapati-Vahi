import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { GiElephant } from 'react-icons/gi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back! 🙏');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in-up">
      <div className="paper-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <GiElephant className="text-5xl text-maroon mx-auto mb-3 drop-shadow-sm" />
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-maroon drop-shadow-sm">Welcome Back</h1>
          <p className="text-ink-light font-subheading mt-1">Sign in to your Ganapati Vahi</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-2 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm font-subheading text-ink-light mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-maroon hover:text-maroon-dark font-medium no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
