import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import AddForm from '@/components/user/addForm';
import { useAppContext } from '@/context/AppContext';

import { createUser } from './api';

const initialForm = {
    name: '',
   
    avatar: null,
    avatar_preview: '',
    email: '',
    password: '',
    c_password: '',
};

function validateForm(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = ['The user name field is required.'];
    }

    if (!form.email.trim()) {
        errors.email = ['The email field is required.'];
    }

  

  

    if (!form.password) {
        errors.password = ['The password field is required.'];
    }

    if (!form.c_password) {
        errors.c_password = ['The confirm password field is required.'];
    } else if (form.password !== form.c_password) {
        errors.c_password = ['The confirm password must match password.'];
    }

    return errors;
}

export default function AddUser() {
    const navigate = useNavigate();
    const { setPageTitle } = useAppContext();

    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [requestError, setRequestError] = useState('');

    useEffect(() => {
        setPageTitle('Add User');
    }, [setPageTitle]);

    const handleChange = (event) => {
        const { name, value, files } = event.target;
        if (name === 'avatar') {
            const file = files?.[0] || null;
            const preview = file ? URL.createObjectURL(file) : '';
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

        const validationErrors = validateForm(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setRequestError('');
            return;
        }

        setIsSubmitting(true);
        setErrors({});
        setRequestError('');

        try {
            await createUser({
                name: form.name.trim(),
                
                avatar: form.avatar,
                email: form.email.trim(),
                password: form.password,
                c_password: form.c_password,
            });

            toast.success('User created successfully.', {
                style: { color: '#16a34a' },
            });
            navigate('/panel/users');
        } catch (error) {
            setErrors(error.payload?.errors || {});
            if (!error.payload?.errors) {
                const message = error.message || 'Failed to create user.';
                setRequestError(message);
                toast.error(message, { style: { color: '#dc2626' } });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            {requestError && <p className="text-sm text-destructive">{requestError}</p>}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                <AddForm
                    form={form}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/panel/users')}
                    isSubmitting={isSubmitting}
                    errors={errors}
                    avatarPreview={form.avatar_preview}
                />
            </div>
        </div>
    );
}


