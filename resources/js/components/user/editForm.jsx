import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function EditForm({
    form = {},
    onChange,
    onSubmit,
    onCancel,
    isSubmitting = false,
    errors = {},
    avatarPreview = '',
    submitLabel = 'Update User',
    submittingLabel = 'Updating...',
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
               
            </CardHeader>
            <Separator />

            <form onSubmit={onSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                        <Label htmlFor="edit-user-avatar">Avatar</Label>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No Image</div>
                                )}
                            </div>
                            <div className="flex-1 space-y-2">
                                <Input
                                    id="edit-user-avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="sr-only"
                                    onChange={onChange}
                                    disabled={isSubmitting}
                                />
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        className={isSubmitting ? 'pointer-events-none opacity-50' : ''}
                                    >
                                        <label htmlFor="edit-user-avatar">Choose File</label>
                                    </Button>
                                    <p className="text-sm text-muted-foreground">{form.avatar?.name || 'No file chosen'}</p>
                                </div>
                                <p className="text-xs text-muted-foreground">Accepted formats: PNG, JPG, JPEG, WEBP.</p>
                            </div>
                        </div>
                        {errors.avatar && <p className="text-xs text-destructive">{errors.avatar[0]}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="edit-user-name">User Name</Label>
                            <Input
                                id="edit-user-name"
                                name="name"
                                value={form.name || ''}
                                onChange={onChange}
                                placeholder="e.g. John Doe"
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name[0]}</p>}
                        </div>

                      
                       

                        <div className="space-y-2">
                            <Label htmlFor="edit-user-password">New Password</Label>
                            <Input
                                id="edit-user-password"
                                name="password"
                                type="password"
                                value={form.password || ''}
                                onChange={onChange}
                                placeholder="Leave empty to keep existing"
                            />
                            {errors.password && <p className="text-xs text-destructive">{errors.password[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-confirm-password">Confirm New Password</Label>
                            <Input
                                id="edit-confirm-password"
                                name="c_password"
                                type="password"
                                value={form.c_password || ''}
                                onChange={onChange}
                                placeholder="Repeat new password"
                            />
                            {errors.c_password && <p className="text-xs text-destructive">{errors.c_password[0]}</p>}
                        </div>
                    </div>
                </CardContent>

                <Separator />

                <CardFooter className="flex justify-end gap-3 pt-6">
                    <Button variant="outline" onClick={onCancel} type="button" disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? submittingLabel : submitLabel}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
