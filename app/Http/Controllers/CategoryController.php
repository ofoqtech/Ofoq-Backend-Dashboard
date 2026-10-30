<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Project;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of project categories.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Category::class);

        $search = $request->input('search');

        $categories = Category::query()
            ->withCount('projects')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name->ar', 'like', "%{$search}%")
                        ->orWhere('name->en', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('description->ar', 'like', "%{$search}%")
                        ->orWhere('description->en', 'like', "%{$search}%");
                });
            })
            ->orderBy('order', 'asc')
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('categories/index', [
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
            ],
            'canManageCategories' => $request->user()->isAdmin(),
        ]);
    }

    /**
     * Show the form for creating a new category.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Category::class);

        return Inertia::render('categories/create');
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Category::class);

        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'description_en' => ['nullable', 'string', 'max:1000'],
            'description_ar' => ['nullable', 'string', 'max:1000'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $slug = ! empty($validated['slug'])
            ? Category::generateUniqueSlug($validated['slug'])
            : Category::generateUniqueSlug($validated['name_en']);

        Category::create([
            'slug' => $slug,
            'name' => [
                'en' => $validated['name_en'],
                'ar' => $validated['name_ar'],
            ],
            'description' => [
                'en' => $validated['description_en'] ?? '',
                'ar' => $validated['description_ar'] ?? '',
            ],
            'order' => $validated['order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    /**
     * Show the form for editing the specified category.
     */
    public function edit(Request $request, Category $category): Response
    {
        Gate::authorize('update', $category);

        return Inertia::render('categories/edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified category in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        Gate::authorize('update', $category);

        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_ar' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description_en' => ['nullable', 'string', 'max:1000'],
            'description_ar' => ['nullable', 'string', 'max:1000'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $oldSlug = $category->slug;
        $newSlug = ! empty($validated['slug'])
            ? Category::generateUniqueSlug($validated['slug'], $category->id)
            : $category->slug;

        $category->name = [
            'en' => $validated['name_en'],
            'ar' => $validated['name_ar'],
        ];
        $category->slug = $newSlug;
        $category->description = [
            'en' => $validated['description_en'] ?? '',
            'ar' => $validated['description_ar'] ?? '',
        ];
        $category->order = $validated['order'] ?? 0;
        $category->is_active = $validated['is_active'] ?? true;
        $category->save();

        // If slug changed, keep referenced projects in sync
        if ($oldSlug !== $newSlug) {
            Project::where('category', $oldSlug)->update([
                'category' => $newSlug,
                'category_label' => $category->name,
            ]);
        } else {
            // Update cached label on existing projects
            Project::where('category', $newSlug)->update([
                'category_label' => $category->name,
            ]);
        }

        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(Request $request, Category $category): RedirectResponse
    {
        Gate::authorize('delete', $category);

        $projectsCount = $category->projects()->count();
        if ($projectsCount > 0) {
            return back()->with('error', "Cannot delete category '{$category->name_en}' because it is assigned to {$projectsCount} project(s). Reassign them first.");
        }

        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}

