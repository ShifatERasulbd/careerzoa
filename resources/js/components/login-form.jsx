import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

export function LoginForm() {
    const navigate = useNavigate();
    const { setUser } = useAppContext();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGoogleLogin = () => {
        // Start OAuth flow through backend route on the current app base path.
        const oauthUrl = new URL('/api/auth/google/redirect', window.location.origin);
        window.location.href = oauthUrl.toString();
    };

    const handleChange = (event) => {
        const { id, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [id]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setIsSubmitting(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const response = await fetch('/api/login', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                setErrorMessage(payload?.message || 'Unable to login. Please check your credentials.');
                return;
            }

            const userResponse = await fetch('/api/user', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (userResponse.ok) {
                const userPayload = await userResponse.json();
                setUser(userPayload);
            }

            navigate('/panel/dashboard');
        } catch {
            setErrorMessage('Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md rounded-2xl border border-border bg-card p-2 shadow-sm">
            <CardHeader className="space-y-2 pb-2 text-center">
                <CardTitle className="text-3xl font-semibold tracking-tight">Welcome back</CardTitle>
                <CardDescription>Login with Email or Google account</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    className="grid gap-4"
                    onSubmit={handleSubmit}
                >
                  

                    <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground">
                        <div className="h-px flex-1 bg-border" />
                        <span>Or continue with</span>
                        <div className="h-px flex-1 bg-border" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/panel/forgot-password" className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline">
                                Forgot your password?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="current-password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {errorMessage ? (
                        <p className="text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}

                    <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-center gap-2"
                        disabled={isSubmitting}
                        onClick={handleGoogleLogin}
                    >
                        <span className="text-sm font-semibold">G</span>
                        Login with Google
                    </Button>
                    <p className="text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link to="/panel/register" className="font-medium text-foreground underline underline-offset-4">
                            Sign up
                        </Link>
                    </p>

                    <p className="pt-2 text-center text-xs leading-relaxed text-muted-foreground">
                        By clicking continue, you agree to our{' '}
                        <a href="#" className="underline underline-offset-4">Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className="underline underline-offset-4">Privacy Policy</a>.
                    </p>

                   
                </form>
            </CardContent>
        </Card>
    );
}