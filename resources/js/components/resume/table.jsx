    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from '@/components/ui/table';
    import {
        Tooltip,
        TooltipContent,
        TooltipProvider,
        TooltipTrigger,
    } from '@/components/ui/tooltip';
    import { Download, Trash2 } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card } from '@/components/ui/card';
    import { Switch } from '@/components/ui/switch';

    function formatFileSize(bytes) {
        if (!bytes && bytes !== 0) {
            return '-';
        }
        if (bytes < 1024) {
            return `${bytes} B`;
        }
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    export default function ResumeTable({ 
        resumes = [], 
        onRequestDelete, 
        deletingId, 
        onSelectResume,
        onToggleStatus 
    }) {
        return (
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">SL No</TableHead>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resumes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                    No resumes found.
                                </TableCell>
                            </TableRow>
                        )}

                        {resumes.map((resume, index) => {
                            const isActive = Boolean(resume.is_active);

                            return (
                                <TableRow key={resume.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell 
                                        className="max-w-[240px] truncate font-medium text-primary cursor-pointer hover:underline" 
                                        onClick={() => onSelectResume?.(resume)}
                                    >
                                        {resume.original_name}
                                    </TableCell>
                                    <TableCell className="uppercase">{resume.extension}</TableCell>
                                    <TableCell>{formatFileSize(resume.file_size)}</TableCell>
                                    
                                    {/* Status Switch Cell */}
                                   <TableCell onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={isActive}
                                                onCheckedChange={(checked) => {
                                                    onToggleStatus?.(resume, checked);
                                                }}
                                                aria-label={`Toggle active status for ${resume.original_name}`}
                                            className="cursor-pointer"/>
                                            <span className="text-xs text-muted-foreground select-none">
                                                {isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {resume.created_at ? new Date(resume.created_at).toLocaleDateString() : '-'}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Download ${resume.original_name}`}
                                                            onClick={() => window.open(resume.url, '_blank')}
                                                        >
                                                            <Download />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>Download</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            aria-label={`Delete ${resume.original_name}`}
                                                            onClick={() => onRequestDelete?.(resume)}
                                                            disabled={deletingId === resume.id}
                                                        >
                                                            <Trash2 className="text-destructive" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="bottom">
                                                        <p>Delete</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        );
    }