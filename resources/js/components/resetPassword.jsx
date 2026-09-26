import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ResetPasswordForm() {
    const navigate = useNavigate();
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const initialEmail = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
    const [form, setForm] = useState({
        email: initialEmail,
        password: '',
        passwordConfirmation: '',
    });
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

        if (form.password !== form.passwordConfirmation) {
            setErrorMessage('Password confirmation does not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const response = await fetch('/api/reset-password', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    token,
                    email: form.email,
                    password: form.password,
                    password_confirmation: form.passwordConfirmation,
                }),
            });

            const payload = await response.json().catch(() => null);

            if (!response.ok) {
                const validationErrors = payload?.errors ? Object.values(payload.errors).flat() : [];
                setErrorMessage(validationErrors[0] || payload?.message || 'Unable to reset password.');
                return;
            }

            navigate('/', { replace: true });
        } catch {
            setErrorMessage('Unable to reach the server. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md rounded-2xl border border-border bg-card p-2 shadow-sm">
            <CardHeader className="space-y-2 pb-2 text-center">
                <CardTitle className="text-3xl font-semibold tracking-tight">Reset password</CardTitle>
                <CardDescription>Choose a new password for your account.</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="passwordConfirmation">Confirm Password</Label>
                        <Input
                            id="passwordConfirmation"
                            type="password"
                            autoComplete="new-password"
                            value={form.passwordConfirmation}
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
                        {isSubmitting ? 'Resetting password...' : 'Reset password'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        <Link to="/" className="font-medium text-foreground underline underline-offset-4">
                            Back to login
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
