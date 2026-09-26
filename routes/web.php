<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Resumecontroller;
use App\Http\Controllers\GoogleAuthController;
use Illuminate\Support\Facades\Route;

// Redirect root to /panel login
Route::get('/', function () {
    return redirect('/panel');
});

// Panel Auth Routes
Route::prefix('panel')->group(function () {
    Route::get('/', function () {
        return view('app');
    })->name('login');

    Route::get('/register', function () {
        return view('app');
    })->name('register');

    Route::get('/forgot-password', function () {
        return view('app');
    })->name('password.request');

    Route::get('/reset-password/{token}', function () {
        return view('app');
    })->name('password.reset');
});

// API Routes
Route::prefix('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:6,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:6,1');
    
    // google login
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('google.callback');
   
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', [UserController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::apiResource('/users', UserController::class);
        Route::apiResource('resumes', ResumeController::class); 
        Route::get('/resumes/{resume}/parsed', [Resumecontroller::class, 'showParsed']);
        Route::post('/resumes/{resume}/ats-score', [Resumecontroller::class, 'atsScore']);
    });
});

// Protected SPA Catch-all Routes under /panel
Route::prefix('panel')->middleware('auth:sanctum')->group(function () {
    Route::get('/{path}', function () {
        return view('app');
    })->where('path', '^(?!api\/).*$');
});