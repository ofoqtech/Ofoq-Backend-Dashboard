<?php

namespace App\Http\Controllers;

use App\Enums\Role;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard view with key system analytics.
     */
    public function __invoke(Request $request): Response
    {
        $totalProjects = Project::count();
        $totalEmployees = User::where('role', Role::Employee)->count();
        $totalAdmins = User::where('role', Role::Admin)->count();

        $categories = [
            'web' => Project::where('category', 'web')->count(),
            'mobile' => Project::where('category', 'mobile')->count(),
            'erp' => Project::where('category', 'erp')->count(),
        ];

        $recentProjects = Project::query()
            ->latest()
            ->take(5)
            ->get(['id', 'slug', 'title', 'category', 'category_label', 'image', 'technologies', 'created_at']);

        $recentEmployees = User::query()
            ->where('role', Role::Employee)
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'role', 'title', 'phone', 'status', 'created_at']);

        return Inertia::render('dashboard', [
            'stats' => [
                'totalProjects' => $totalProjects,
                'totalEmployees' => $totalEmployees,
                'totalAdmins' => $totalAdmins,
                'categories' => $categories,
            ],
            'recentProjects' => $recentProjects,
            'recentEmployees' => $recentEmployees,
        ]);
    }
}
