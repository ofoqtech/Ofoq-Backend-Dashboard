<?php

namespace App\Http\Controllers;

use App\Enums\LeadStatus;
use App\Enums\Role;
use App\Models\Category;
use App\Models\Lead;
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
        $userCounts = User::query()
            ->selectRaw('role, count(*) as count')
            ->groupBy('role')
            ->pluck('count', 'role');

        $totalEmployees = (int) ($userCounts[Role::Employee->value] ?? 0);
        $totalAdmins = (int) ($userCounts[Role::Admin->value] ?? 0);

        $totalProjects = Project::count();
        $totalCategories = Category::count();

        $leadCounts = Lead::query()
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $totalLeads = (int) $leadCounts->sum();
        $newLeadsCount = (int) ($leadCounts[LeadStatus::New->value] ?? 0);

        $projectCountsByCategory = Project::query()
            ->selectRaw('category, count(*) as count')
            ->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();

        $categories = [
            'web' => $projectCountsByCategory['web'] ?? 0,
            'mobile' => $projectCountsByCategory['mobile'] ?? 0,
            'erp' => $projectCountsByCategory['erp'] ?? 0,
        ];

        $activeCategories = Category::withCount('projects')->get(['id', 'slug']);
        foreach ($activeCategories as $cat) {
            $categories[$cat->slug] = $cat->projects_count;
        }

        $recentProjects = Project::query()
            ->latest()
            ->take(5)
            ->get(['id', 'slug', 'title', 'category', 'category_label', 'image', 'technologies', 'created_at']);

        $recentEmployees = User::query()
            ->where('role', Role::Employee)
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'role', 'title', 'phone', 'status', 'created_at']);

        $recentLeads = Lead::query()
            ->with(['assignee', 'service'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'totalProjects' => $totalProjects,
                'totalEmployees' => $totalEmployees,
                'totalAdmins' => $totalAdmins,
                'totalCategories' => $totalCategories,
                'totalLeads' => $totalLeads,
                'newLeadsCount' => $newLeadsCount,
                'categories' => $categories,
            ],
            'recentProjects' => $recentProjects,
            'recentEmployees' => $recentEmployees,
            'recentLeads' => $recentLeads,
        ]);
    }
}
