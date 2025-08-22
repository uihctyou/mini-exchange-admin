'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2, Shield, Settings, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const locale = useLocale();
  const { login, isLoading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = email && password && isValidEmail(email) && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!canSubmit) return;

    try {
      await login(email, password, remember);
      // Show success message briefly before redirect
      setSuccess(true);
      setTimeout(() => {
        // Use window.location for a hard redirect to ensure it works
        window.location.href = `/${locale}/dashboard`;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ME</span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('app.name')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('app.description')}
          </p>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t('auth.login')}</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Success Alert */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Login successful! Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('auth.email')}
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setSuccess(false);
                  }}
                  className={`${
                    email && !isValidEmail(email) 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : ''
                  }`}
                />
                {email && !isValidEmail(email) && (
                  <p className="text-sm text-red-600">{t('validation.email')}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                      setSuccess(false);
                    }}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                    {t('auth.remember')}
                  </label>
                </div>

                <div className="text-sm">
                  <a 
                    href="#" 
                    className="font-medium text-primary hover:text-primary/80"
                    onClick={(e) => e.preventDefault()}
                  >
                    {t('auth.forgotPassword')}
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('common.loading')}
                    </>
                  ) : (
                    t('auth.loginButton')
                  )}
                </Button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Demo Credentials (Click to auto-fill)
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setEmail('admin@example.com');
                    setPassword('admin123');
                    setError('');
                    setSuccess(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-600 flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </span>
                    <span className="text-gray-500">admin@example.com / admin123</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Full system access</div>
                </button>
                
                <button
                  type="button"
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setEmail('operator@example.com');
                    setPassword('operator123');
                    setError('');
                    setSuccess(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-600 flex items-center gap-1">
                      <Settings className="h-3 w-3" />
                      Operator
                    </span>
                    <span className="text-gray-500">operator@example.com / operator123</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Daily operations management</div>
                </button>
                
                <button
                  type="button"
                  className="w-full text-left p-2 text-xs bg-white rounded border hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setEmail('auditor@example.com');
                    setPassword('auditor123');
                    setError('');
                    setSuccess(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-purple-600 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      Auditor
                    </span>
                    <span className="text-gray-500">auditor@example.com / auditor123</span>
                  </div>
                  <div className="text-gray-400 text-xs mt-1">Read-only access for auditing</div>
                </button>
                
                {/* Test Error Case */}
                <button
                  type="button"
                  className="w-full text-left p-2 text-xs bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors"
                  onClick={() => {
                    setEmail('invalid@example.com');
                    setPassword('wrongpassword');
                    setError('');
                    setSuccess(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Test Error
                    </span>
                    <span className="text-gray-500">invalid@example.com / wrongpassword</span>
                  </div>
                  <div className="text-red-400 text-xs mt-1">Click to test error handling</div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
