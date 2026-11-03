<?php

namespace App\Http\Controllers\Settings;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
        ]);

        if (array_key_exists('title', $validated) || array_key_exists('title_ar', $validated)) {
            $titleInput = $request->input('title');
            if (is_array($titleInput)) {
                $user->title = $titleInput;
            } elseif ($request->has('title_ar') || is_string($titleInput)) {
                $currentTitle = is_array($user->title) ? $user->title : [];
                $user->title = [
                    'en' => (string) ($titleInput ?? ($currentTitle['en'] ?? '')),
                    'ar' => (string) ($request->input('title_ar') ?? ($currentTitle['ar'] ?? '')),
                ];
            }
        }

        if ($request->hasFile('avatar')) {
            $user->deleteAvatarFile();
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        } elseif ($request->boolean('remove_avatar')) {
            $user->deleteAvatarFile();
            $user->avatar = null;
        }

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit')->with('success', __('Profile updated.'));
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $adminCount = User::where('role', Role::Admin)->count();
            if ($adminCount <= 1) {
                return back()->with('error', 'Cannot delete the only remaining administrator account.');
            }
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
