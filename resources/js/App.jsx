import React, { Suspense, lazy } from 'react'
import { ForgotPasswordForm } from '@/components/forgotPassword';
import { LoginForm } from '@/components/login-form';
import { RegisterForm } from '@/components/register-form';
import { ResetPasswordForm } from '@/components/resetPassword';
import { Toaster } from '@/components/ui/sonner';
import { AppProvider } from '@/context/AppContext';
import AppLayout from '@/layouts/AppLayout';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

function lazyWithRetry(importer, key) {
    return lazy(async () => {
        const storageKey = `lazy-retry:${key}`;

        try {
            const module = await importer();
            sessionStorage.removeItem(storageKey);
            return module;
        } catch (error) {
            const hasRetried = sessionStorage.getItem(storageKey) === '1';

            if (!hasRetried && error instanceof TypeError) {
                sessionStorage.setItem(storageKey, '1');
                window.location.reload();
                return new Promise(() => {});
            }

            sessionStorage.removeItem(storageKey);
            throw error;
        }
    });
}

const Dashboard = lazyWithRetry(() => import('@/pages/dashboard'), 'dashboard');

// user route
const Users = lazyWithRetry(() => import('@/pages/User/user'), 'users');
const AddUser = lazyWithRetry(() => import('@/pages/User/addUser'), 'users-add');
const EditUser = lazyWithRetry(() => import('@/pages/User/editUser'), 'users-edit');

// resume route
const Resumes = lazyWithRetry(() => import('@/pages/Resumes/resumes'), 'resumes');
const ResumeDetailPage=lazyWithRetry(()=>import ('@/pages/Resumes/ResumeDetailPage'));

function AuthScreen({ children }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10 text-foreground">
            <div className="w-full max-w-md space-y-5">
                <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-900">
                    <span className="inline-flex size-6 items-center justify-center rounded-full border border-slate-900 text-[11px]">A</span>
                    <span>Acme Inc.</span>
                </div>
                {children}
            </div>
        </main>
    );
}

export default function App() {
    return (
        <AppProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
                    <Routes>
                        {/* Auth Routes under /panel */}
                        <Route
                            path="/panel"
                            element={
                                <AuthScreen>
                                    <LoginForm />
                                </AuthScreen>
                            }
                        />

                        <Route
                            path="/panel/register"
                            element={
                                <AuthScreen>
                                    <RegisterForm />
                                </AuthScreen>
                            }
                        />

                        <Route
                            path="/panel/forgot-password"
                            element={
                                <AuthScreen>
                                    <ForgotPasswordForm />
                                </AuthScreen>
                            }
                        />

                        <Route
                            path="/panel/reset-password/:token"
                            element={
                                <AuthScreen>
                                    <ResetPasswordForm />
                                </AuthScreen>
                            }
                        />

                        {/* Protected Panel Routes */}
                        <Route element={<AppLayout />}>
                            <Route path="/panel/dashboard" element={<Dashboard />} />
                          
                            {/* users */}
                            <Route path="/panel/users" element={<Users />} />
                            <Route path="/panel/users/add" element={<AddUser />} />
                            <Route path="/panel/users/:id/edit" element={<EditUser />} />

                            {/* resumes */}
                            <Route path="/panel/resumes" element={<Resumes />} />
                            <Route path="/panel/resumes/:id" element={<ResumeDetailPage />} />
                        </Route>

                        {/* Fallback redirect */}
                        <Route path="*" element={<Navigate to="/panel" replace />} />
                    </Routes>
                </Suspense>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
        </AppProvider>
    );
}