import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

import EditForm from '@/components/user/editForm';
import { useAppContext } from '@/context/AppContext';

import { fetchUser, updateUser } from './api';

const initialForm = {
    name: '',
    
    email: '',
    
    avatar: null,
    avatar_preview: '',
    password: '',
    c_password: '',
};

export default function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setPageTitle, user: authUser } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const isSelfEdit = Number(id) === Number(authUser?.id);

    useEffect(() => {
        setPageTitle('My Profile');
    }, [setPageTitle]);

    useEffect(() => {
        let ignore = false;

        async function loadData() {
            setIsLoading(true);
            setLoadError('');

            try {
                const user = await fetchUser(id);

                if (!ignore) {
                    setForm({
                        name: user?.name || '',
                       
                        email: user?.email || '',
                        
                        avatar: null,
                        avatar_preview: user?.avatar || '',
                        password: '',
                        c_password: '',
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setLoadError(error.message || 'Failed to load user.');
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
        const { name, value, files } = event.target;
        if (name === 'avatar') {
            const file = files?.[0] || null;
            const preview = file ? URL.createObjectURL(file) : (form.avatar_preview || '');
            setForm((previous) => ({ ...previous, avatar: file, avatar_preview: preview }));
        } else {
            setForm((previous) => ({ ...previous, [name]: value }));
        }
        setErrors((previous) => {
            if (!previous[name]) return previous;
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.password && form.password !== form.c_password) {
            setErrors({ c_password: ['The confirm password must match password.'] });
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setLoadError('');

        try {
            const payload = {
                name: form.name.trim(),
              
                email: form.email.trim(),
              
                avatar: form.avatar,
                password: form.password,
                c_password: form.c_password,
            };

            await updateUser(id, payload);

            toast.success('User updated successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/panel/users');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to update user.';
                setLoadError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Loading user...</p>;
    }

    return (
        <div className="space-y-4">
            {loadError && <p className="text-sm text-destructive">{loadError}</p>}

            <EditForm
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/panel/users')}
                isSubmitting={isSubmitting}
                errors={errors}
                avatarPreview={form.avatar_preview}
                submitLabel="Update User"
                submittingLabel="Updating..."
            />
        </div>
    );
}