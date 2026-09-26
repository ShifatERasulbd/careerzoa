import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

export default function AddForm({
    form = {},
    onChange,
    onPermissionToggle,
    onSubmit,
    onCancel,
    permissions = [],
    permissionsByCategory = [],
    isSubmitting = false,
    errors = {},
}) {
    // Group permissions by category if not already grouped
    const grouped = permissionsByCategory.length > 0 
        ? permissionsByCategory 
        : permissions.reduce((acc, perm) => {
            const existing = acc.find(g => g.category === perm.category);
            if (existing) {
                existing.permissions.push(perm);
            } else {
                acc.push({
                    category: perm.category || 'other',
                    permissions: [perm],
                });
            }
            return acc;
        }, []);

    const formatCategoryName = (category) => {
        return category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatActionName = (slug) => {
        const match = slug.match(/^(create|read|update|delete)-/);
        if (match) {
            return match[1].charAt(0).toUpperCase() + match[1].slice(1);
        }
        return 'View';
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Role</CardTitle>
                <CardDescription>Create a new role and assign detailed access permissions.</CardDescription>
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="role-name">Role Name</Label>
                        <Input
                            id="role-name"
                            name="name"
                            value={form.name || ''}
                            onChange={onChange}
                            placeholder="e.g. Manager"
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                    </div>

                    <div className="space-y-6">
                        <Label className="text-base font-semibold">Assign Detailed Access Permissions</Label>
                        
                        {grouped && grouped.length > 0 ? (
                            <div className="space-y-6">
                                {grouped.map((group) => (
                                    <div key={group.category} className="border rounded-lg p-4 space-y-3">
                                        <h3 className="font-semibold text-sm text-slate-700">
                                            {formatCategoryName(group.category)}
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 ml-2">
                                            {['create', 'read', 'update', 'delete'].map((action) => {
                                                const permission = group.permissions.find(p => 
                                                    p.slug === `${action}-${group.category}`
                                                );
                                                
                                                return permission ? (
                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={form.permissions?.includes(permission.id) || false}
                                                            onCheckedChange={() => onPermissionToggle(permission.id)}
                                                        />
                                                        <Label 
                                                            htmlFor={`permission-${permission.id}`} 
                                                            className="font-normal cursor-pointer text-sm"
                                                        >
                                                            {formatActionName(permission.slug)}
                                                        </Label>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-slate-500 py-4">
                                No permissions available
                            </div>
                        )}
                        
                        {errors.permissions && <p className="text-xs text-destructive">{errors.permissions[0]}</p>}
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Role'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
