import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';

export function RegisterForm() {
    const navigate = useNavigate();
    const { setUser } = useAppContext();
    const [form, setForm] = useState({
        name: '',
        email: '',
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

            const response = await fetch('/api/register', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    name: form.name,
                    
                    email: form.email,
                    password: form.password,
                    password_confirmation: form.passwordConfirmation,
                }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                const validationErrors = payload?.errors ? Object.values(payload.errors).flat() : [];
                setErrorMessage(validationErrors[0] || payload?.message || 'Unable to register. Please check your details.');
                return;
            }

            const payload = await response.json();
            if (payload?.user) {
                setUser(payload.user);
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
                <CardTitle className="text-3xl font-semibold tracking-tight">Create account</CardTitle>
                <CardDescription>Start your workspace in under a minute</CardDescription>
            </CardHeader>
            <CardContent>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={form.name} onChange={handleChange} required />
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
                        <Label htmlFor="password">Password</Label>
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
                        {isSubmitting ? 'Creating account...' : 'Create account'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/panel" className="font-medium text-foreground underline underline-offset-4">
                            Login
                        </Link>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
