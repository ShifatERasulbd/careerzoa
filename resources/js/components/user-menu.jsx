import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, CircleUser } from 'lucide-react';

export function UserMenu({ user, warehouseName }) {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userMenuRef = useRef(null);

    const markNotificationsAsSeen = () => {};

    const clearNotifications = () => {
        setNotifications([]);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
                setIsNotificationOpen(false);
            }
        }

        function handleEscape(event) {
            if (event.key === 'Escape') {
                setIsUserMenuOpen(false);
                setIsNotificationOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    useEffect(() => {
        setNotifications([]);
        setIsLoadingNotifications(false);
    }, [user]);

    const notificationCount = notifications.filter((notification) => !notification.seen).length;

    const severityClassName = (severity) => {
        if (severity === 'danger') {
            return 'border-l-red-500';
        }
        if (severity === 'warning') {
            return 'border-l-amber-500';
        }
        return 'border-l-blue-500';
    };

    const handleLogout = async () => {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch('/sanctum/csrf-cookie', {
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
        } finally {
            setIsLoggingOut(false);
            setIsUserMenuOpen(false);
            navigate('/panel');
        }
    };

    const handleProfileClick = () => {
        if (user?.id) {
            setIsUserMenuOpen(false);
            navigate(`/panel/users/${user.id}/edit`);
            return;
        }

        navigate('/panel/users');
    };

        const handleResume = () => {
            if (user?.id) {
                setIsUserMenuOpen(false);
                navigate('/panel/resumes');
                return;
            }

            navigate('/panel/resumes');
        };

    return (
        <div
            ref={userMenuRef}
            className="relative inline-flex items-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-1.5 shadow-sm"
        >
            <button
                type="button"
                onClick={() => {
                    markNotificationsAsSeen();
                    setIsNotificationOpen((prev) => !prev);
                    setIsUserMenuOpen(false);
                }}
                className="relative inline-flex items-center rounded p-0.5 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-haspopup="menu"
                aria-expanded={isNotificationOpen}
                aria-label="Open notifications"
            >
                <BellRing className="h-5 w-5" />
                {notificationCount > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                )}
            </button>
            <button
                type="button"
                onClick={() => {
                    setIsUserMenuOpen((prev) => !prev);
                    setIsNotificationOpen(false);
                }}
                className="inline-flex items-center rounded p-0.5 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-haspopup="menu"
                aria-expanded={isUserMenuOpen}
                aria-label="Open user menu"
            >
                <CircleUser className="h-5 w-5" />
            </button>

            {isNotificationOpen && (
                <div className="absolute right-0 top-11 z-50 w-80 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Notifications</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Workspace</span>
                            <button
                                type="button"
                                onClick={clearNotifications}
                                className="rounded border border-gray-300 px-2 py-0.5 text-[11px] font-medium text-gray-600 hover:bg-gray-100"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {isLoadingNotifications && (
                        <p className="py-4 text-center text-sm text-gray-500">Loading...</p>
                    )}

                    {!isLoadingNotifications && notifications.length === 0 && (
                        <p className="py-4 text-center text-sm text-gray-500">No notifications found.</p>
                    )}

                    {!isLoadingNotifications && notifications.length > 0 && (
                        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                            {notifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => {
                                        markNotificationsAsSeen([notification.id]);
                                        setIsNotificationOpen(false);
                                        navigate(notification.path);
                                    }}
                                    className={`w-full rounded-md border border-gray-200 border-l-4 bg-white p-2 text-left transition hover:bg-gray-50 ${severityClassName(notification.severity)}`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                        <span className={`text-[11px] font-medium ${notification.seen ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {notification.seen ? 'Seen' : 'Unseen'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">{notification.description}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

           {isUserMenuOpen && (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Profile</p>
                    <button
                        type="button"
                        onClick={handleProfileClick}
                        className="mt-1 text-left text-sm font-semibold text-gray-900 underline-offset-2 hover:underline"
                    >
                        {user?.name || 'Unknown User'}
                    </button>

                    <button
                        type="button"
                        onClick={handleResume}
                        className="mt-1 block text-left text-sm text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
                    >
                        My Resume
                    </button>

                    

                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="mt-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </button>
                </div>
            )}
        </div>
    );
}
