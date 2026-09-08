import { useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FormFooter from '../../components/FormFooter';
import FormHeader from '../../components/FormHeader';
import './Signup.css';

const initialValue = {
  email: '',
  password: '',
  confirmPassword: '',
  emergencyNumber: '',
};

type Errors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  emergencyNumber?: string;
};

function reducer(state: typeof initialValue, action: { type: string; payload: string }) {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_PASS':
      return { ...state, password: action.payload };
    case 'SET_CONFIRM_PASS':
      return { ...state, confirmPassword: action.payload };
    case 'SET_EMERGENCY_NUMBER':
      return { ...state, emergencyNumber: action.payload };
    default:
      return state;
  }
}

function Signup() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialValue);
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (localStorage.getItem('currentUser')) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  function getUsers() {
    const savedUsers = localStorage.getItem('users');
    try {
      return savedUsers ? JSON.parse(savedUsers) : [];
    } catch {
      return [];
    }
  }

  function validateInputs() {
    const newErrors: Errors = {};

    if (!state.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!state.password) {
      newErrors.password = 'Password is required';
    } else if (state.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(state.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[a-z]/.test(state.password)) {
      newErrors.password = 'Password must contain a lowercase letter';
    } else if (!/[0-9]/.test(state.password)) {
      newErrors.password = 'Password must contain a number';
    } else if (!/[!@#$%^&*]/.test(state.password)) {
      newErrors.password = 'Password must contain a special character';
    }

    if (!state.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (state.password !== state.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!state.emergencyNumber.trim()) {
      newErrors.emergencyNumber = 'Emergency number is required';
    } else if (!/^(\+92|0)3\d{9}$/.test(state.emergencyNumber.trim())) {
      newErrors.emergencyNumber = 'Enter a valid Pakistani phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const users = getUsers();

    if (!validateInputs()) {
      return;
    }

    const isFound = users.some(
      (user: { email?: string }) =>
        user.email?.toLowerCase() === state.email.trim().toLowerCase()
    );

    if (isFound) {
      toast.error('User already exists', { id: 'validation-error' });
      return;
    }

    const newUser = {
      email: state.email.trim(),
      password: state.password,
      emergencyNumber: state.emergencyNumber.trim(),
      children: [],
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    toast.success('Account created successfully!', { id: 'signup-success' });
    navigate('/login');
  }

  return (
    <div className="auth-page signup-page">
      <div className="auth-shell">
      
        <div className="auth-card signup-card">
          <FormHeader
            title="SafeChild"
            text="QR"
            heading="Create Your Account"
            detail="Register to keep your family connected and protected"
          />

          <form onSubmit={handleSubmit} className="auth-form signup-form">
            <div className="input-field">
              <span className="input-icon">✉</span>
              <input
                type="email"
                placeholder="Email Address"
                value={state.email}
                onChange={(e) =>
                  dispatch({ type: 'SET_EMAIL', payload: e.target.value })
                }
              />
            </div>
            {errors.email && <p className="field-error">{errors.email}</p>}

            <div className="input-field">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                placeholder="Password"
                value={state.password}
                onChange={(e) =>
                  dispatch({ type: 'SET_PASS', payload: e.target.value })
                }
              />
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}

            <div className="input-field">
              <span className="input-icon">🔐</span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={state.confirmPassword}
                onChange={(e) =>
                  dispatch({ type: 'SET_CONFIRM_PASS', payload: e.target.value })
                }
              />
            </div>
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}

            <div className="input-field">
              <span className="input-icon">📞</span>
              <input
                type="text"
                placeholder="Emergency Number"
                value={state.emergencyNumber}
                onChange={(e) =>
                  dispatch({ type: 'SET_EMERGENCY_NUMBER', payload: e.target.value })
                }
              />
            </div>
            {errors.emergencyNumber && <p className="field-error">{errors.emergencyNumber}</p>}

            <button type="submit" className="primary-btn">Sign Up</button>
          </form>

          <div className="auth-footer">
            <FormFooter text="Already have an account?" goto="login" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup