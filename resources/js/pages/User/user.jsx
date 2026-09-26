import { useEffect, useState } from 'react';
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
import UserTable from '@/components/user/table';

import { deleteUser, fetchUsers } from './api';

export default function Users() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const canCreate = true;
    const canUpdate = true;
    const canDelete = true;

    useEffect(() => {
        setPageTitle('Users');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadUsers() {
            setIsLoading(true);
            setErrorMessage('');

            try {
                const data = await fetchUsers();
                if (!ignore) {
                    setUsers(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(error.message || 'Failed to load users.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadUsers();

        return () => {
            ignore = true;
        };
    }, []);

    const handleConfirmDelete = async () => {
        if (!userToDelete) {
            return;
        }

        const id = userToDelete.id;
        setDeletingId(id);
        setErrorMessage('');

        try {
            await deleteUser(id);
            setUsers((previous) => (Array.isArray(previous) ? previous : []).filter((user) => user.id !== id));
            toast.success('User deleted successfully.', {
                style: { color: '#16a34a' },
            });
            setUserToDelete(null);
        } catch (error) {
            const message = error.message || 'Failed to delete user.';
            setErrorMessage(message);
            toast.error(message, {
                style: { color: '#dc2626' },
            });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
           <div className="space-y-5">
                {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <UserTable
                    users={users}
                    isLoading={isLoading}
                    deletingId={deletingId}
                    onAdd={() => navigate('/panel/users/add')}
                    onEdit={(id) => navigate(`/panel/users/${id}/edit`)}
                    onRequestDelete={setUserToDelete}
                    canCreate={canCreate}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                />
                </div>

                <AlertDialog
                    open={Boolean(userToDelete)}
                    onOpenChange={(open) => !open && setUserToDelete(null)}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
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
        </>
    );
}