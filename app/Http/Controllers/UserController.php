<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function storeAvatarUpload(Request $request, ?string $oldAvatar = null): ?string
    {
        if (! $request->hasFile('avatar')) {
            return $oldAvatar;
        }

        $file = $request->file('avatar');
        $directory = public_path('uploads/users');

        if (! File::exists($directory)) {
            File::makeDirectory($directory, 0755, true);
        }

        $extension = $file->getClientOriginalExtension() ?: 'jpg';
        $filename = Str::uuid()->toString().'.'.$extension;
        $file->move($directory, $filename);

        if (! empty($oldAvatar)) {
            $oldPath = public_path(ltrim($oldAvatar, '/'));
            if (File::exists($oldPath)) {
                File::delete($oldPath);
            }
        }

        return '/uploads/users/'.$filename;
    }

    private function attachWarehouses(array $userData): array
    {
        $userData['warehouses'] = [];
        $userData['warehouse'] = null;

        return $userData;
    }

    public function index(): JsonResponse
    {
        $result = User::query()->orderBy('id')->get();

      

        return response()->json($result);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $userData = $this->attachWarehouses($user->toArray());

        return response()->json($userData);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:100'],
          
            'email'           => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'        => ['required', 'string', 'min:6', 'same:c_password'],
            'c_password'      => ['required', 'string', 'min:6'],
            'avatar'          => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        unset($validated['c_password']);
        unset($validated['avatar']);

        $validated['avatar'] = $this->storeAvatarUpload($request);

        $user = User::query()->create($validated);

        $userData = $this->attachWarehouses($user->toArray());

        return response()->json($userData, 201);
    }

    public function show(User $user): JsonResponse
    {
        $userData = $this->attachWarehouses($user->toArray());

        return response()->json($userData);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $actor = $request->user();

        if ((int) $actor->id !== (int) $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:100'],
            
            'email'           => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
         
            'password'   => ['nullable', 'string', 'min:6', 'same:c_password'],
            'c_password' => ['nullable', 'string', 'min:6'],
            'avatar'     => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        unset($validated['c_password']);
        unset($validated['avatar']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $validated['avatar'] = $this->storeAvatarUpload($request, $user->avatar);

        $user->update($validated);

        $fresh = $user->fresh();
        $userData = $this->attachWarehouses($fresh->toArray());

        return response()->json($userData);
    }

    public function destroy(User $user): JsonResponse
    {
        if (! empty($user->avatar)) {
            $avatarPath = public_path(ltrim($user->avatar, '/'));
            if (File::exists($avatarPath)) {
                File::delete($avatarPath);
            }
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
