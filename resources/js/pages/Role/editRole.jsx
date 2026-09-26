import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/role/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchRole, fetchPermissionsByCategory, updateRole } from './api';

const initialForm = {
    name: '',
    permissions: [],
};

export default function EditRole() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [permissionsByCategory, setPermissionsByCategory] = useState([]);

    useEffect(() => {
        setPageTitle('Edit Role');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const [role, permissionsPayload] = await Promise.all([
                    fetchRole(id),
                    fetchPermissionsByCategory(),
                ]);

                if (!ignore) {
                    const rolePermissionIds = (role.permissions || []).map((p) => p.id);
                    setForm({
                        name: role?.name || '',
                        permissions: rolePermissionIds,
                    });
                    setPermissionsByCategory(Array.isArray(permissionsPayload) ? permissionsPayload : []);
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load role.');
                }
            } finally {
                if (!ignore) {
                    setIsLoading(false);
                }
            }
        }

        loadData();

        return () => {
            ignore = true;
        };
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => {
            if (!previous[name]) {
                return previous;
            }

            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handlePermissionToggle = (permissionId) => {
        setForm((previous) => {
            const permissions = previous.permissions.includes(permissionId)
                ? previous.permissions.filter((id) => id !== permissionId)
                : [...previous.permissions, permissionId];

            return {
                ...previous,
                permissions,
            };
        });

        setErrors((previous) => {
            if (!previous.permissions) {
                return previous;
            }

            const next = { ...previous };
            delete next.permissions;
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            const name = form.name.trim();
            await updateRole(id, {
                name,
                slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                permission_ids: form.permissions,
            });

            toast.success('Role updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/roles');
        } catch (error) {
            const payload = error.payload || {};
            const fieldErrors = payload.errors || {};

            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors);
            } else {
                const message = error.message || 'Failed to update role.';
                setLoadError(message);
                toast.error(message, {
                    style: { color: '#dc2626' },
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        navigate('/roles');
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading...</div>;
    }

    return (
        <div className="space-y-5">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <EditForm
                    form={form}
                    onChange={handleChange}
                    onPermissionToggle={handlePermissionToggle}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    permissionsByCategory={permissionsByCategory}
                    isSubmitting={isSubmitting}
                    errors={errors}
                />
            </div>
        </div>
    );
}
