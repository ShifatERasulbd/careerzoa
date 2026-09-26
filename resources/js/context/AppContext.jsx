import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [pageTitle, setPageTitle] = useState('Dashboard');

    function can() {
        return true;
    }

    return (
        <AppContext.Provider value={{ user, setUser, pageTitle, setPageTitle, can }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
