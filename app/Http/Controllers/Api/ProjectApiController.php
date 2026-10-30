<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectApiController extends Controller
{
    /**
     * Return all active project categories formatted for ofoq-frontend.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        return response()->json([
            'success' => true,
            'count' => $categories->count(),
            'data' => $categories,
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Return all projects formatted for ofoq-frontend.
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');

        $projects = Project::query()
            ->with('images')
            ->when($category && $category !== 'all', fn ($q) => $q->where('category', $category))
            ->orderBy('order')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'count' => $projects->count(),
            'data' => $projects,
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * Return a single project by slug or ID.
     */
    public function show(Project $project): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $project->load('images'),
        ], 200, [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }
}
