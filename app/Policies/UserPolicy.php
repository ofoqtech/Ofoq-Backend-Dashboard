<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Only Admin can create employees or admins.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     * Only Admin can update employees or admins.
     */
    public function update(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     * Only Admin can delete employees or admins.
     */
    public function delete(User $user, User $model): bool
    {
        // Cannot delete self
        if ($user->id === $model->id) {
            return false;
        }

        return $user->isAdmin();
    }

    /**
     * Determine whether the user can manage administrators.
     */
    public function manageAdmins(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can manage roles (e.g. promote to Admin).
     */
    public function manageRoles(User $user): bool
    {
        return $user->isAdmin();
    }
}
