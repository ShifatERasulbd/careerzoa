<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Role extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'slug',
    ];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    /**
     * Check if role has a specific permission
     */
    public function hasPermission(string $permissionSlug): bool
    {
        return $this->permissions()->where('slug', $permissionSlug)->exists();
    }

    /**
     * Check if role has any CRUD action for a resource
     */
    public function hasResourceAccess(string $resource): bool
    {
        return $this->permissions()
            ->where('category', $resource)
            ->exists();
    }

    /**
     * Check if role can perform a specific action on a resource
     */
    public function canPerformAction(string $action, string $resource): bool
    {
        return $this->hasPermission("{$action}-{$resource}");
    }

    /**
     * Get all CRUD actions available for a specific resource
     */
    public function getResourceActions(string $resource): array
    {
        return $this->permissions()
            ->where('category', $resource)
            ->pluck('slug')
            ->mapWithKeys(function ($slug) {
                preg_match('/^(create|read|update|delete)-(.+)$/', $slug, $matches);
                return [$matches[1] ?? 'unknown' => true];
            })
            ->toArray();
    }

     public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('Role')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}





