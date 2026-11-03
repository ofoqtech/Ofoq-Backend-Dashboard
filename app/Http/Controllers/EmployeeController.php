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

class EmployeeController extends Controller
{
    /**
     * Display a listing of employees.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = $request->input('search');
        $status = $request->input('status');

        $employees = User::query()
            ->where('role', Role::Employee)
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

        return Inertia::render('employees/index', [
            'employees' => $employees,
            'filters' => [
                'search' => $search ?? '',
                'status' => $status ?? '',
            ],
            'canManageEmployees' => $request->user()->isAdmin(),
            'canManageRoles' => $request->user()->isAdmin(),
        ]);
    }

    /**
     * Show the form for creating a new employee.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', User::class);

        return Inertia::render('employees/create', [
            'canManageRoles' => $request->user()->isAdmin(),
        ]);
    }

    /**
     * Store a newly created employee in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', Rule::enum(Role::class)],
            'title' => ['nullable'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
        ]);

        $titleInput = $request->input('title');
        $title = is_array($titleInput) ? $titleInput : [
            'en' => (string) ($titleInput ?? ''),
            'ar' => (string) ($request->input('title_ar') ?? ''),
        ];

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
        }

        $role = Role::Employee;
        if ($request->user()->isAdmin() && ! empty($validated['role'])) {
            $role = Role::from($validated['role']);
        }

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $role,
            'title' => $title,
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
            'avatar' => $avatarPath,
            'email_verified_at' => now(),
        ]);

        if ($role === Role::Admin) {
            return redirect()->route('admins.index')->with('success', 'Administrator created successfully.');
        }

        return redirect()->route('employees.index')->with('success', 'Employee created successfully.');
    }

    /**
     * Show the form for editing the specified employee.
     */
    public function edit(Request $request, User $employee): Response
    {
        Gate::authorize('update', $employee);

        if ($employee->isAdmin()) {
            abort(404);
        }

        return Inertia::render('employees/edit', [
            'employee' => $employee,
            'canManageRoles' => $request->user()->isAdmin(),
        ]);
    }

    /**
     * Update the specified employee in storage.
     */
    public function update(Request $request, User $employee): RedirectResponse
    {
        Gate::authorize('update', $employee);

        if ($employee->isAdmin()) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($employee->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['nullable', Rule::enum(Role::class)],
            'title' => ['nullable'],
            'title_ar' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:5120'],
            'remove_avatar' => ['nullable', 'boolean'],
        ]);

        $titleInput = $request->input('title');
        $title = is_array($titleInput) ? $titleInput : [
            'en' => (string) ($titleInput ?? ''),
            'ar' => (string) ($request->input('title_ar') ?? ''),
        ];

        $employee->name = $validated['name'];
        $employee->email = $validated['email'];

        if ($request->user()->isAdmin() && ! empty($validated['role'])) {
            $newRole = Role::from($validated['role']);
            if ($employee->isAdmin() && $newRole === Role::Employee) {
                $adminCount = User::where('role', Role::Admin)->count();
                if ($adminCount <= 1) {
                    return back()->with('error', 'Cannot demote the only remaining administrator.');
                }
            }
            $employee->role = $newRole;
        }

        $employee->title = $title;
        $employee->phone = $validated['phone'] ?? null;
        $employee->status = $validated['status'];

        if ($request->hasFile('avatar')) {
            $employee->deleteAvatarFile();
            $employee->avatar = $request->file('avatar')->store('avatars', 'public');
        } elseif ($request->boolean('remove_avatar')) {
            $employee->deleteAvatarFile();
            $employee->avatar = null;
        }

        if (! empty($validated['password'])) {
            $employee->password = Hash::make($validated['password']);
        }

        $employee->save();

        if ($employee->isAdmin()) {
            return redirect()->route('admins.index')->with('success', "User '{$employee->name}' promoted to Administrator successfully.");
        }

        return redirect()->route('employees.index')->with('success', 'Employee updated successfully.');
    }

    /**
     * Update the system role of the specified employee.
     */
    public function updateRole(Request $request, User $employee): RedirectResponse
    {
        Gate::authorize('manageRoles', User::class);

        $validated = $request->validate([
            'role' => ['required', Rule::enum(Role::class)],
        ]);

        $newRole = Role::from($validated['role']);

        if ($employee->isAdmin() && $newRole === Role::Employee) {
            $adminCount = User::where('role', Role::Admin)->count();
            if ($adminCount <= 1) {
                return back()->with('error', 'Cannot demote the only remaining administrator.');
            }
        }

        $employee->role = $newRole;
        $employee->save();

        $message = $newRole === Role::Admin
            ? "User '{$employee->name}' promoted to Administrator successfully."
            : "User '{$employee->name}' role changed to Employee successfully.";

        return back()->with('success', $message);
    }

    /**
     * Remove the specified employee from storage.
     */
    public function destroy(Request $request, User $employee): RedirectResponse
    {
        Gate::authorize('delete', $employee);

        if ($employee->isAdmin()) {
            abort(404);
        }

        $employee->deleteAvatarFile();
        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Employee deleted successfully.');
    }
}
