import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Check, X, AtSign } from 'lucide-react';
import { useAuthStore } from '../../store';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// Password validation helper
function validatePassword(password) {
    return {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[@!#$%&*\-_+=?.]/.test(password),
    };
}

// Password Strength Meter Component - Shows one hint at a time
function PasswordStrengthMeter({ password }) {
    const debouncedPassword = useDebounce(password, 300);
    const checks = useMemo(() => validatePassword(debouncedPassword), [debouncedPassword]);
    const allPassed = Object.values(checks).every(Boolean);

    const requirements = [
        { key: 'minLength', label: 'Add at least 8 characters', passed: checks.minLength },
        { key: 'hasUppercase', label: 'Add an uppercase letter (A-Z)', passed: checks.hasUppercase },
        { key: 'hasLowercase', label: 'Add a lowercase letter (a-z)', passed: checks.hasLowercase },
        { key: 'hasNumber', label: 'Add a number (0-9)', passed: checks.hasNumber },
        { key: 'hasSpecial', label: 'Add a special character (!@#$%&*-_+=?.)', passed: checks.hasSpecial },
    ];

    // Find first unfulfilled requirement
    const nextHint = requirements.find(r => !r.passed);

    if (!debouncedPassword) return null;

    return (
        <div className={`mt-1 text-xs ${allPassed ? 'text-green-600' : 'text-gray-500'}`}>
            {allPassed ? (
                <span className="flex items-center gap-1">
                    <Check size={12} /> Strong password!
                </span>
            ) : (
                <span className="flex items-center gap-1">
                    <span className="text-orange-500">→</span> {nextHint?.label}
                </span>
            )}
        </div>
    );
}


// Reusable Input Component with animation
function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    icon: Icon,
    iconPrefix,
    showToggle,
    showPassword,
    onTogglePassword,
    hint,
    className = ''
}) {
    return (
        <div className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}>
            {label && <label className="block text-sm font-bold text-gray-700 mb-1.5">{label}</label>}
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />}
                {iconPrefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{iconPrefix}</span>}
                <input
                    type={showToggle ? (showPassword ? 'text' : 'password') : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${Icon || iconPrefix ? 'pl-10' : 'pl-4'} ${showToggle ? 'pr-12' : 'pr-4'} py-3 rounded-xl border-2 border-black focus:outline-none focus:ring-2 focus:ring-pink-300 font-medium transition-all duration-200`}
                />
                {showToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
        </div>
    );
}

export default function AuthPage() {
    const { login: onLogin, register: onRegister, loading, error } = useAuthStore();

    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [loginIdentifier, setLoginIdentifier] = useState(''); // Can be email or username
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [formError, setFormError] = useState('');
    const [lockoutCountdown, setLockoutCountdown] = useState(0);

    // Lockout countdown timer
    useEffect(() => {
        if (error?.lockedUntil) {
            const updateCountdown = () => {
                const remaining = Math.max(0, Math.ceil((new Date(error.lockedUntil).getTime() - Date.now()) / 1000));
                setLockoutCountdown(remaining);
                return remaining;
            };

            const remaining = updateCountdown();
            if (remaining > 0) {
                const interval = setInterval(() => {
                    const r = updateCountdown();
                    if (r <= 0) clearInterval(interval);
                }, 1000);
                return () => clearInterval(interval);
            }
        } else {
            setLockoutCountdown(0);
        }
    }, [error?.lockedUntil]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');

        // Auto-trim all fields
        const trimmedName = name.trim();
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();

        if (isLogin) {
            if (!loginIdentifier.trim() || !password) {
                setFormError('Please fill in all fields');
                return;
            }
            try {
                await onLogin(loginIdentifier.trim(), password);
            } catch (err) {
                // Error handling is managed by store/component state via error prop
                console.error("Login failed", err);
            }
        } else {
            if (!trimmedName || !trimmedUsername || !trimmedEmail || !password || !confirmPassword) {
                setFormError('Please fill in all fields');
                return;
            }
            if (password !== confirmPassword) {
                setFormError('Passwords do not match');
                return;
            }
            // Validate password strength
            const checks = validatePassword(password);
            const allPassed = Object.values(checks).every(Boolean);
            if (!allPassed) {
                setFormError('Password does not meet all requirements');
                return;
            }
            if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
                setFormError('Username: 3-20 chars, lowercase, numbers, underscores');
                return;
            }
            try {
                await onRegister({ name: trimmedName, username: trimmedUsername, email: trimmedEmail, password });
            } catch (err) {
                console.error("Registration failed", err);
            }
        }
    };

    const switchMode = () => {
        setFormError('');
        setIsTransitioning(true);

        setTimeout(() => {
            setIsLogin(!isLogin);
            setName('');
            setUsername('');
            setEmail('');
            setLoginIdentifier('');
            setPassword('');
            setConfirmPassword('');
            setIsTransitioning(false);
        }, 150);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF5] flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-pink-200 rounded-full blur-3xl opacity-50 transition-all duration-700"
                    style={{ transform: isLogin ? 'translateX(0)' : 'translateX(-50px)' }}></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-200 rounded-full blur-3xl opacity-50 transition-all duration-700"
                    style={{ transform: isLogin ? 'translateX(0)' : 'translateX(50px)' }}></div>
            </div>

            <div className="relative w-full max-w-lg">
                {/* Logo/Brand */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] mb-3 transition-transform duration-300 hover:rotate-12">
                        <Sparkles className="text-yellow-300" size={28} />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900">CollabSpace</h1>
                </div>

                {/* Auth Card */}
                <div className={`bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 transition-all duration-200 ${isTransitioning ? 'scale-[0.98]' : 'scale-100'}`}>
                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-xl border-2 border-black mb-5 relative overflow-hidden">
                        {/* Sliding background */}
                        <div
                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-accent rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 ease-out"
                            style={{ left: isLogin ? '4px' : 'calc(50% + 2px)' }}
                        ></div>
                        <button
                            onClick={() => !isLogin && switchMode()}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative z-10 ${isLogin ? 'text-black' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => isLogin && switchMode()}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative z-10 ${!isLogin ? 'text-black' : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Message */}
                    {(error || formError) && (
                        <div className={`px-4 py-2.5 rounded-xl mb-4 text-sm font-medium animate-in fade-in duration-300 ${error?.warning
                            ? 'bg-yellow-50 border-2 border-yellow-400 text-yellow-800'
                            : error?.lockedUntil
                                ? 'bg-orange-50 border-2 border-orange-400 text-orange-800'
                                : 'bg-red-50 border-2 border-red-400 text-red-700'
                            }`}>
                            {error?.message || error?.error || formError || (typeof error === 'string' ? error : 'An error occurred')}
                            {error?.remainingAttempts !== undefined && !error?.warning && (
                                <span className="text-gray-500 text-xs ml-2">
                                    ({error.remainingAttempts} attempts remaining)
                                </span>
                            )}
                            {error?.lockedUntil && (
                                <div className="flex items-center gap-2 mt-2 text-sm">
                                    <span className="text-lg">🔒</span>
                                    <div>
                                        <div className="font-bold">Account locked</div>
                                        {lockoutCountdown > 0 ? (
                                            <div className="text-xs flex items-center gap-1">
                                                Try again in
                                                <span className="inline-block px-2 py-0.5 bg-orange-200 rounded font-mono font-bold text-orange-900 animate-pulse">
                                                    {Math.floor(lockoutCountdown / 60)}:{String(lockoutCountdown % 60).padStart(2, '0')}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-green-600 font-medium">✓ You can try again now!</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} key={isLogin ? 'login' : 'signup'}>
                        <div className="space-y-4">
                            {/* Sign Up Fields - Two columns */}
                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        label="Full Name"
                                        icon={User}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                    />
                                    <Input
                                        label="Username"
                                        iconPrefix="@"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                        placeholder="johndoe"
                                    />
                                </div>
                            )}

                            {/* Email or Username for login, Email for register */}
                            {isLogin ? (
                                <Input
                                    label="Email or Username"
                                    type="text"
                                    icon={AtSign}
                                    value={loginIdentifier}
                                    onChange={(e) => setLoginIdentifier(e.target.value)}
                                    placeholder="you@example.com or @username"
                                />
                            ) : (
                                <Input
                                    label="Email"
                                    type="email"
                                    icon={Mail}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            )}

                            {/* Password fields - Two columns for signup */}
                            {!isLogin ? (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Password"
                                            icon={Lock}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            showToggle
                                            showPassword={showPassword}
                                            onTogglePassword={() => setShowPassword(!showPassword)}
                                        />
                                        <Input
                                            label="Confirm"
                                            icon={Lock}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            showToggle
                                            showPassword={showPassword}
                                            onTogglePassword={() => setShowPassword(!showPassword)}
                                        />
                                    </div>
                                    {/* Real-time password strength meter */}
                                    <PasswordStrengthMeter password={password} />
                                </>
                            ) : (
                                <Input
                                    label="Password"
                                    icon={Lock}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    showToggle
                                    showPassword={showPassword}
                                    onTogglePassword={() => setShowPassword(!showPassword)}
                                />
                            )}

                            {/* Submit Button - with Google inline for register */}
                            {!isLogin ? (
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-black text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Create Account
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                    <a
                                        href="http://localhost:5000/api/auth/google"
                                        className="px-4 py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none flex items-center justify-center"
                                        title="Sign up with Google"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                    </a>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3 bg-black text-white font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                Sign In
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                    {/* OAuth Divider - only for login */}
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-xs text-gray-400 font-medium">or</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>
                                    {/* Google OAuth Button - full width for login */}
                                    <a
                                        href="http://localhost:5000/api/auth/google"
                                        className="w-full py-3 bg-white text-gray-700 font-bold rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none flex items-center justify-center gap-3"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </a>
                                </>
                            )}
                        </div>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-sm text-gray-500 mt-5">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={switchMode} className="font-bold text-pink-600 hover:underline transition-all">
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

                {/* Demo hint */}
                <p className="mt-3 text-center text-xs text-gray-400">
                    Demo: john@example.com or @johndoe
                </p>
            </div>
        </div>
    );
}
