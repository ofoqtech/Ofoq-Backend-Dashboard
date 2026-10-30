<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display a listing of system administrators.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('manageAdmins', User::class);

        $search = $request->input('search');
        $status = $request->input('status');

        $admins = User::query()
            ->where('role', Role::Admin)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('title->en', 'like', "%{$search}%")
                        ->orWhere('title->ar', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admins/index', [
            'admins' => $admins,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
            'currentAdminId' => $request->user()->id,
        ]);
    }

    /**
     * Show the form for creating a new administrator.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('manageAdmins', User::class);

        return Inertia::render('admins/create');
    }

    /**
     * Store a newly created administrator in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('manageAdmins', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'title' => ['nullable'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $titleInput = $request->input('title');
        $title = is_array($titleInput) ? $titleInput : [
            'en' => (string) ($titleInput ?? ''),
            'ar' => (string) ($request->input('title_ar') ?? ''),
        ];

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => Role::Admin,
            'title' => $title,
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
            'email_verified_at' => now(),
        ]);

        return redirect()->route('admins.index')->with('success', 'Administrator created successfully.');
    }

    /**
     * Show the form for editing the specified administrator.
     */
    public function edit(Request $request, User $admin): Response
    {
        Gate::authorize('manageAdmins', User::class);

        if (! $admin->isAdmin()) {
            abort(404);
        }

        return Inertia::render('admins/edit', [
            'admin' => $admin,
            'isSelf' => $request->user()->id === $admin->id,
        ]);
    }

    /**
     * Update the specified administrator in storage.
     */
    public function update(Request $request, User $admin): RedirectResponse
    {
        Gate::authorize('manageAdmins', User::class);

        if (! $admin->isAdmin()) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($admin->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'title' => ['nullable'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:active,inactive'],
        ]);

        $titleInput = $request->input('title');
        $title = is_array($titleInput) ? $titleInput : [
            'en' => (string) ($titleInput ?? ''),
            'ar' => (string) ($request->input('title_ar') ?? ''),
        ];

        $admin->name = $validated['name'];
        $admin->email = $validated['email'];
        $admin->title = $title;
        $admin->phone = $validated['phone'] ?? null;
        $admin->status = $validated['status'];

        if (! empty($validated['password'])) {
            $admin->password = Hash::make($validated['password']);
        }

        $admin->save();

        return redirect()->route('admins.index')->with('success', 'Administrator updated successfully.');
    }

    /**
     * Remove the specified administrator from storage.
     */
    public function destroy(Request $request, User $admin): RedirectResponse
    {
        Gate::authorize('manageAdmins', User::class);

        if (! $admin->isAdmin()) {
            abort(404);
        }

        if ($admin->id === $request->user()->id) {
            return back()->with('error', 'You cannot delete your own administrator account.');
        }

        $adminCount = User::where('role', Role::Admin)->count();
        if ($adminCount <= 1) {
            return back()->with('error', 'Cannot delete the only remaining administrator.');
        }

        $admin->delete();

        return redirect()->route('admins.index')->with('success', 'Administrator deleted successfully.');
    }
}
