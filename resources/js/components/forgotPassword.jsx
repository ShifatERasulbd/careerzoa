import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setIsSubmitting(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ email }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const validationErrors = payload?.errors ? Object.values(payload.errors).flat() : [];
                setErrorMessage(validationErrors[0] || payload?.message || 'Unable to send reset link.');
                return;
            }

            setSuccessMessage(payload?.message || 'Password reset link sent. Check your email.');
        } catch {
            setErrorMessage('Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md rounded-2xl border border-border bg-card p-2 shadow-sm">
            <CardHeader className="space-y-2 pb-2 text-center">
                <CardTitle className="text-3xl font-semibold tracking-tight">Forgot password</CardTitle>
                <CardDescription>Enter your email address and we will send you a reset link.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            autoComplete="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    {errorMessage ? (
                        <p className="text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}

                    {successMessage ? (
                        <p className="text-sm text-emerald-600" role="status">
                            {successMessage}
                        </p>
                    ) : null}

                    <Button type="submit" className="mt-1 w-full" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Remembered your password?{' '}
                        <Link to="/" className="font-medium text-foreground underline underline-offset-4">
                            Back to login
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
