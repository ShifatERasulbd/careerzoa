<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request)
    {
        $callbackUrl = route('google.callback');

        return Socialite::driver('google')
            ->stateless()
            ->redirectUrl($callbackUrl)
            ->redirect();
    }

    public function callback(Request $request)
    {
        try {
            // Keep the same redirect_uri used in the initial authorize redirect.
            $googleUser = Socialite::driver('google')
                ->stateless()
                ->redirectUrl($request->url())
                ->user();
        } catch (ClientException) {
            return redirect('/?error=google_redirect_uri_mismatch');
        }

        if (empty($googleUser->email)) {
            return redirect('/?error=google_email_not_available');
        }

        $user = User::where('email', $googleUser->email)->first();

        if (!$user) {
            $user = User::create([
                'name' => $googleUser->name ?? 'Google User',
                'company_name' => 'Google Signup',
                'phone_number' => 'N/A',
                'email' => $googleUser->email,
                'google_id' => $googleUser->id,
                'password' => bcrypt(Str::random(16)),
            ]);
        } elseif (empty($user->google_id)) {
            $user->update([
                'google_id' => $googleUser->id,
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        // Redirect to dashboard on the current app base URL.
        return redirect()->to(url('/dashboard'));
    }
}