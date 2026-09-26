import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    ArrowLeft,
    FileText,
    Mail,
    Phone,
    User,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchParsedResume } from './api';

import AtsScoreCard from './AtsScoreCard';

const MONTH =
    '(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\.?\\s+';

const DATE_RANGE = new RegExp(
    `(?:${MONTH})?\\d{4}\\s*[-–—]\\s*(?:Present|Current|Now|(?:${MONTH})?\\d{4})`,
    'i'
);

const isJobHeader = (line) =>
    !/^\s*[•●▪*]/.test(line) && DATE_RANGE.test(line);

export default function ResumeDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [parsedData, setParsedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let ignore = false;

        async function loadResume() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchParsedResume(id);

                if (!ignore) {
                    setParsedData(data);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(
                        error?.message || 'Failed to load resume.'
                    );
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadResume();

        return () => {
            ignore = true;
        };
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <p className="text-sm text-muted-foreground p-6">
                    Loading...
                </p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-white">
                <p className="text-sm text-destructive p-6">
                    {errorMessage}
                </p>
            </div>
        );
    }

    if (!parsedData) {
        return (
            <div className="min-h-screen bg-white">
                <p className="text-sm text-muted-foreground p-6">
                    Resume not found.
                </p>
            </div>
        );
    }

    const personalInfo =
        parsedData?.personal_info &&
        typeof parsedData.personal_info === 'object'
            ? parsedData.personal_info
            : {};

    const sections = Array.isArray(parsedData?.sections)
        ? parsedData.sections
        : [];

    const allTabs = [
        {
            key: 'personal-info',
            heading: 'Personal Information',
            isPersonal: true,
        },
        ...sections.map((sec, idx) => ({
            key: sec.key || `section-${idx}`,
            heading: sec.heading || `Section ${idx + 1}`,
            content: sec.content || '',
            isPersonal: false,
        })),
    ];

    const defaultTab = allTabs.length > 0 ? allTabs[0].key : '';

    return (
        <div className="min-h-screen bg-white space-y-6 p-6">
            {/* Top Action Bar with Back Button & ATS Score Trigger */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={() => navigate('/panel/resumes')}
                    className="gap-2 border-gray-200"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Resumes
                </Button>

                <AtsScoreCard resumeId={id} />
            </div>

            {/* Side-by-Side Layout */}
            {allTabs.length > 0 ? (
                <Tabs defaultValue={defaultTab} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Left Column Styled Card Container matching the right-side cards */}
{/* Left Column Styled Card Container matching the right-side cards */}
<div className="lg:col-span-3 bg-white">
  
        <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-0 justify-start">
            {allTabs.map((tab) => (
                <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="w-full justify-start gap-2 rounded-none text-left px-4 py-3 data-[state=active]:bg-muted data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                    {tab.isPersonal ? (
                        <User className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                    )}
                    <span className="truncate">{tab.heading}</span>
                </TabsTrigger>
            ))}
        </TabsList>
    
</div>

                    {/* Right Content Column (Span 9) */}
                    <div className="w-full min-w-0 lg:col-span-9">
                        {allTabs.map((tab) => {
                            if (tab.isPersonal) {
                                return (
                                    <TabsContent key={tab.key} value={tab.key} className="mt-0 outline-none">
                                        <Card className="border border-gray-200 shadow-sm bg-white">
                                            <CardHeader className="border-b border-gray-100">
                                                <CardTitle className="flex items-center gap-2 text-lg">
                                                    <User className="h-5 w-5 text-primary" />
                                                    {tab.heading}
                                                </CardTitle>
                                            </CardHeader>

                                            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Full Name</p>
                                                    <p className="font-medium mt-1">{personalInfo?.name || '-'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        Email
                                                    </p>
                                                    <p className="font-medium mt-1">{personalInfo?.email || '-'}</p>
                                                </div>

                                                <div>
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Phone className="h-3.5 w-3.5" />
                                                        Phone
                                                    </p>
                                                    <p className="font-medium mt-1">{personalInfo?.phone || '-'}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                );
                            }

                            const lines = tab.content ? tab.content.split('\n') : [];

                            return (
                                <TabsContent key={tab.key} value={tab.key} className="mt-0 outline-none">
                                    <Card className="border border-gray-200 shadow-sm bg-white">
                                        <CardHeader className="border-b border-gray-100">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <FileText className="h-5 w-5 text-primary" />
                                                {tab.heading}
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="space-y-3 text-sm leading-relaxed">
                                            {lines.length > 0 ? (
                                                lines.map((line, i) => {
                                                    const safeLine = typeof line === 'string' ? line : String(line ?? '');

                                                    return isJobHeader(safeLine) ? (
                                                        <p key={i} className="font-bold text-foreground pt-4 first:pt-0">
                                                            {safeLine}
                                                        </p>
                                                    ) : (
                                                        <p key={i} className="text-muted-foreground">
                                                            {safeLine || '\u00A0'}
                                                        </p>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-sm text-muted-foreground">
                                                    No content available for this section.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            );
                        })}
                    </div>
                </Tabs>
            ) : (
                <Card className="border border-gray-200 shadow-sm bg-white">
                    <CardContent className="py-6">
                        <p className="text-sm text-muted-foreground">
                            No resume content found.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}