import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAppContext } from '@/context/AppContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';

import ResumeTable from '@/components/resume/table';
import { createResume, deleteResume, fetchResumes, updateResume } from './api';

export default function Resumes() {
    const { setPageTitle } = useAppContext();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [resumes, setResumes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [resumeToDelete, setResumeToDelete] = useState(null);

    useEffect(() => {
        setPageTitle('My Resume');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadResumes() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchResumes();
                if (!ignore) {
                    setResumes(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load resumes.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadResumes();

        return () => {
            ignore = true;
        };
    }, []);

    // Open the parsed resume on its own route
    const handleSelectResume = (resume) => {
        navigate(`/panel/resumes/${resume.id}`);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        setIsUploading(true);
        setErrorMessage('');

        try {
            const uploaded = await createResume(file);
            setResumes((previous) => [uploaded, ...(Array.isArray(previous) ? previous : [])]);
            toast.success('Resume uploaded successfully.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            const message = error.message || 'Failed to upload resume.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleToggleStatus = async (resume, checked) => {
        try {
            const updated = await updateResume(resume.id, { isActive: checked });
            setResumes((previous) =>
                (Array.isArray(previous) ? previous : []).map((item) => {
                    if (item.id === resume.id) {
                        return updated;
                    }
                    // If this resume was just activated, deactivate all others locally too
                    if (checked) {
                        return { ...item, is_active: false };
                    }
                    return item;
                })
            );
            toast.success('Resume status updated successfully.', {
                style: { color: '#16a34a' },
            });
        } catch (error) {
            const message = error.message || 'Failed to update resume status.';
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        }
    };

    const handleConfirmDelete = async () => {
        if (!resumeToDelete) {
            return;
        }

        const id = resumeToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteResume(id);
            setResumes((previous) => (Array.isArray(previous) ? previous : []).filter((resume) => resume.id !== id));
            toast.success('Resume deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setResumeToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete resume.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setDeletingId(null);
        }
    };

    const hasResumes = resumes.length > 0;

    return (
        <div className="space-y-5">
            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleFileChange}
            />

            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

            {isLoading && (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                    Loading...
                </Card>
            )}

            {!isLoading && !hasResumes && (
                <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <div>
                        <p className="text-sm font-medium">No resume uploaded yet</p>
                        <p className="text-xs text-muted-foreground">PDF or DOCX, up to 5MB</p>
                    </div>
                    <Button
                        className="mt-2"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Resume'}
                    </Button>
                </Card>
            )}

            {!isLoading && hasResumes && (
                <>
                    <div className="flex items-center justify-end">
                        <Button
                            className="gap-2"
                            disabled={isUploading}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {isUploading ? 'Uploading...' : 'Upload New'}
                        </Button>
                    </div>

                    <ResumeTable
                        resumes={resumes}
                        deletingId={deletingId}
                        onRequestDelete={setResumeToDelete}
                        onSelectResume={handleSelectResume}
                        onToggleStatus={handleToggleStatus}
                    />
                </>
            )}

            <AlertDialog
                open={Boolean(resumeToDelete)}
                onOpenChange={(open) => !open && setResumeToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {resumeToDelete?.original_name}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId !== null}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deletingId !== null}
                            onClick={handleConfirmDelete}
                        >
                            {deletingId !== null ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}