import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchStocks } from '@/pages/Stock/api';

export function LowStockAlertTable() {
    const [stocks, setStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const data = await fetchStocks();
                if (!ignore) {
                    setStocks(Array.isArray(data) ? data : []);
                }
            } catch {
                if (!ignore) setStocks([]);
            } finally {
                if (!ignore) setIsLoading(false);
            }
        }

        load();
        return () => { ignore = true; };
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [stocks]);

    const totalItems = stocks.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedStocks = stocks.slice(startIndex, endIndex);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Warehouse Stock Overview</CardTitle>
            </CardHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-right">SL</TableHead>
                        <TableHead className="text-center"> Product</TableHead>
                        <TableHead className="text-center">Color Variant</TableHead>
                        <TableHead className="text-center">Size</TableHead>
                        <TableHead className="text-center">Warehouse</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">Loading...</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && stocks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-muted-foreground">No stock records found.</TableCell>
                        </TableRow>
                    )}
                    {!isLoading && paginatedStocks.map((stock, index) => (
                        <TableRow key={stock.id}>
                            <TableCell className="font-medium text-right">{startIndex + index + 1}</TableCell>
                            <TableCell className="text-center">{stock.name || stock.product_name || (stock.product_id ? `Product #${stock.product_id}` : '—')}</TableCell>
                            <TableCell className="text-center">{stock.color_variant || '—'}</TableCell>
                            <TableCell className="text-center">{stock.size || '—'}</TableCell>
                            <TableCell className="text-center">{stock.warehouse_name || `Warehouse #${stock.warehouse_id}`}</TableCell>
                            <TableCell className="text-center">{stock.available_stock ?? stock.stocks ?? 0}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {!isLoading && totalItems > 0 && (
                <div className="flex items-center justify-between px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={safePage <= 1}
                            onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
                        >
                            Previous
                        </Button>
                        <p className="text-sm text-muted-foreground">Page {safePage} of {totalPages}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={safePage >= totalPages}
                            onClick={() => setCurrentPage((previous) => Math.min(totalPages, previous + 1))}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}