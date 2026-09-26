import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Gauge } from 'lucide-react';
import { fetchAtsScore } from './api';

const textColor = (s) => (s >= 75 ? 'text-green-600' : s >= 50 ? 'text-yellow-600' : 'text-red-600');
const barColor = (s) => (s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-yellow-500' : 'bg-red-500');

export default function AtsScoreCard({ resumeId }) {
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleCheck = async () => {
        setIsLoading(true);
        try {
            setResult(await fetchAtsScore(resumeId, jobDescription));
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to check ATS score.');
        } finally {
            setIsLoading(false);
        }
    };

    const score = Number(result?.score ?? result?.ats_score ?? 0);
    const keywords = result?.keywords && typeof result.keywords === 'object' ? result.keywords : null;
    const matchedKeywords = Array.isArray(keywords?.matched) ? keywords.matched : [];
    const missingKeywords = Array.isArray(keywords?.missing) ? keywords.missing : [];
    const checks = Array.isArray(result?.checks) ? result.checks : [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Gauge className="h-4 w-4" /> Check ATS Score
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Gauge className="h-5 w-5 text-primary" /> ATS Score Checker
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        rows={4}
                        placeholder="Paste a job description to check keyword match (optional)"
                        className="w-full rounded-md border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                    />

                    <Button onClick={handleCheck} disabled={isLoading} className="w-full">
                        {isLoading ? 'Checking...' : 'Run ATS Analysis'}
                    </Button>

                    {result && (
                        <div className="space-y-5 pt-2 border-t">
                            <div className="flex items-end gap-2">
                                <span className={`text-5xl font-bold ${textColor(score)}`}>{score}</span>
                                <span className="pb-1 text-sm text-muted-foreground">/ 100</span>
                            </div>

                            {result.message && (
                                <p className="text-sm text-muted-foreground">{result.message}</p>
                            )}

                            {keywords && (
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold">
                                        Keyword match: {keywords.score ?? 0}%
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {matchedKeywords.map((k) => (
                                            <span key={k} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                                                {k}
                                            </span>
                                        ))}
                                        {missingKeywords.map((k) => (
                                            <span key={k} className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Green = found, red = missing.</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                {checks.map((check) => {
                                    const max = Number(check.max) || 1;
                                    const checkScore = Number(check.score) || 0;
                                    const pct = (checkScore / max) * 100;
                                    return (
                                        <div key={check.label} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{check.label}</span>
                                                <span className="text-muted-foreground">
                                                    {checkScore}/{max}
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded bg-muted">
                                                <div
                                                    className={`h-1.5 rounded ${barColor(pct)}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            {check.tip && (
                                                <p className="text-xs text-muted-foreground">{check.tip}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}