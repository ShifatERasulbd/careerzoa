import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { RoleTable } from '@/components/role/table';
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
import { useAppContext } from '@/context/AppContext';

import { deleteRole, fetchRoles } from './api';

export default function Roles() {
  const navigate = useNavigate();
  const { setPageTitle, can } = useAppContext();
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const canCreate = can('create', 'roles');
  const canUpdate = can('update', 'roles');
  const canDelete = can('delete', 'roles');

  useEffect(() => {
    setPageTitle('Roles');
  }, [setPageTitle]);

  useEffect(() => {
    let ignore = false;

    async function loadRoles() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchRoles();
        if (!ignore) {
          setRoles(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load roles.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadRoles();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConfirmDelete = async () => {
    if (!roleToDelete) {
      return;
    }

    const id = roleToDelete.id;

    setDeletingId(id);
    setErrorMessage('');

    try {
      await deleteRole(id);
      setRoles((previous) => (Array.isArray(previous) ? previous : []).filter((role) => role.id !== id));
      toast.success('Role deleted successfully.', {
        style: { color: '#16a34a' },
      });
      setRoleToDelete(null);
    } catch (error) {
      const message = error.message || 'Failed to delete role.';
      setErrorMessage(message);
      toast.error(message, {
        style: { color: '#dc2626' },
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
        <RoleTable
          roles={roles}
          onAdd={() => navigate('/roles/add')}
          onEdit={(id) => navigate(`/roles/${id}/edit`)}
          onRequestDelete={setRoleToDelete}
          deletingId={deletingId}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </div>

      <AlertDialog open={roleToDelete !== null} onOpenChange={(open) => !open && setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{roleToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deletingId === roleToDelete?.id}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
