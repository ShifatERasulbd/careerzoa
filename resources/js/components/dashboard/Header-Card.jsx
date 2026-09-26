import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export function HeaderCard({ totalUsers = 0 }) {
    const navigate = useNavigate();

    const cards = [
        { title: 'Total Users', amount: totalUsers, prefix: '', path: '/panel/users', color: 'border-blue-500 bg-blue-50' },
    ];

    const renderCard = (item) => (
        <Card
            key={item.title}
            role="button"
            tabIndex={0}
            className={`cursor-pointer border transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.color || ''}`}
            onClick={() => navigate(item.path)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(item.path);
                }
            }}
        >
            <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>Click to view details</CardDescription>
            </CardHeader>
            <CardContent>
                <p><b>{item.prefix}{item.amount}</b></p>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-4 col-span-full">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(renderCard)}
            </div>
        </div>
    );
}