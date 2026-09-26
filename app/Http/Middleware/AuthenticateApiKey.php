<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $plainTextToken = trim((string) $request->header('X-API-Key', ''));

        if ($plainTextToken === '') {
            return $this->unauthorized('API key is required.');
        }

        $accessToken = PersonalAccessToken::findToken($plainTextToken);

        if (! $accessToken) {
            return $this->unauthorized('Invalid API key.');
        }

        $tokenable = $accessToken->tokenable;

        if (! $tokenable) {
            return $this->unauthorized('Invalid API key.');
        }

        $abilities = is_array($accessToken->abilities) ? $accessToken->abilities : [];

        if (! in_array('stocks:read', $abilities, true)) {
            return response()->json([
                'message' => 'This API key does not have stock read access.',
            ], 403);
        }

        $allowedWarehouseIds = collect($abilities)
            ->filter(fn (mixed $ability): bool => is_string($ability) && str_starts_with($ability, 'warehouse:'))
            ->map(fn (string $ability): int => (int) substr($ability, strlen('warehouse:')))
            ->filter(fn (int $warehouseId): bool => $warehouseId > 0)
            ->values()
            ->all();

        $request->attributes->set('allowed_warehouse_ids', $allowedWarehouseIds);
        $request->attributes->set('api_access_token', $accessToken);
        $request->setUserResolver(fn () => $tokenable);

        $accessToken->forceFill([
            'last_used_at' => now(),
        ])->save();

        return $next($request);
    }

    private function unauthorized(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
        ], 401);
    }
}