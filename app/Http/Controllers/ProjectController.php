<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    /**
     * Dynamic categories loaded from database.
     */
    protected function getCategories(): array
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('order')
            ->get();

        if ($categories->isEmpty()) {
            return [
                ['id' => 'web', 'slug' => 'web', 'label' => 'Web & Portals', 'label_ar' => 'بوابات وتطبيقات الويب', 'name_en' => 'Web & Portals', 'name_ar' => 'بوابات وتطبيقات الويب'],
                ['id' => 'mobile', 'slug' => 'mobile', 'label' => 'Mobile Systems', 'label_ar' => 'أنظمة وتطبيقات الجوال', 'name_en' => 'Mobile Systems', 'name_ar' => 'أنظمة وتطبيقات الجوال'],
                ['id' => 'erp', 'slug' => 'erp', 'label' => 'ERP & Cloud', 'label_ar' => 'الأنظمة الإدارية والسحابية', 'name_en' => 'ERP & Cloud', 'name_ar' => 'الأنظمة الإدارية والسحابية'],
            ];
        }

        return $categories->map(fn (Category $cat) => [
            'id' => $cat->slug,
            'slug' => $cat->slug,
            'label' => $cat->name_en ?: $cat->slug,
            'label_ar' => $cat->name_ar ?: '',
            'name_en' => $cat->name_en ?: $cat->slug,
            'name_ar' => $cat->name_ar ?: '',
        ])->toArray();
    }

    /**
     * Display a listing of projects.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Project::class);

        $search = $request->input('search');
        $category = $request->input('category');

        $projects = Project::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title->ar', 'like', "%{$search}%")
                        ->orWhere('title->en', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('tagline->en', 'like', "%{$search}%")
                        ->orWhere('tagline->ar', 'like', "%{$search}%")
                        ->orWhere('description->en', 'like', "%{$search}%")
                        ->orWhere('description->ar', 'like', "%{$search}%")
                        ->orWhere('client', 'like', "%{$search}%");
                });
            })
            ->when($category && $category !== 'all', function ($query, $category) {
                $query->where('category', $category);
            })
            ->orderBy('order')
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('projects/index', [
            'projects' => $projects,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? 'all',
            ],
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Show the form for creating a new project.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', Project::class);

        return Inertia::render('projects/create', [
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Project::class);

        $validated = $request->validate([
            'title' => ['nullable'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:projects,slug'],
            'category' => ['required', 'string', 'max:100'],
            'category_label' => ['nullable'],
            'category_label_ar' => ['nullable', 'string', 'max:150'],
            'tagline' => ['nullable'],
            'tagline_ar' => ['nullable', 'string'],
            'description' => ['nullable'],
            'description_ar' => ['nullable', 'string'],
            'problem' => ['nullable'],
            'problem_ar' => ['nullable', 'string'],
            'solution' => ['nullable'],
            'solution_ar' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:6144'],
            'gallery' => ['nullable', 'array'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:6144'],
            'technologies' => ['nullable', 'array'],
            'features' => ['nullable'],
            'features_ar' => ['nullable', 'array'],
            'metrics' => ['nullable'],
            'metrics_ar' => ['nullable', 'array'],
            'client' => ['nullable', 'string', 'max:255'],
            'live_url' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $titleAr = $request->input('title.ar') ?? (is_string($request->input('title')) ? $request->input('title') : ($request->input('title_ar') ?? ''));
        $titleEn = $request->input('title.en') ?? $request->input('title_en') ?? '';

        if (empty($titleAr) && ! empty($titleEn)) {
            $titleAr = $titleEn;
        }

        $slug = $validated['slug'] ?? '';
        if (empty($slug)) {
            $slug = Project::generateUniqueSlug($titleEn ?: $titleAr);
        }

        $image = $validated['image'] ?? null;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('projects', 'public');
            $image = Storage::url($path);
        }

        $categoryLabelAr = $request->input('category_label.ar') ?? $request->input('category_label_ar') ?? '';
        $categoryLabelEn = $request->input('category_label.en') ?? (is_string($request->input('category_label')) ? $request->input('category_label') : ($request->input('category_label_en') ?? ''));

        if (empty($categoryLabelAr) || empty($categoryLabelEn)) {
            $catModel = Category::where('slug', $validated['category'])->first();
            if ($catModel) {
                $categoryLabelAr = $categoryLabelAr ?: ($catModel->name_ar ?? '');
                $categoryLabelEn = $categoryLabelEn ?: ($catModel->name_en ?? '');
            }
        }

        $taglineAr = $request->input('tagline.ar') ?? $request->input('tagline_ar') ?? '';
        $taglineEn = $request->input('tagline.en') ?? (is_string($request->input('tagline')) ? $request->input('tagline') : ($request->input('tagline_en') ?? ''));

        $descriptionAr = $request->input('description.ar') ?? $request->input('description_ar') ?? '';
        $descriptionEn = $request->input('description.en') ?? (is_string($request->input('description')) ? $request->input('description') : ($request->input('description_en') ?? ''));

        $problemAr = $request->input('problem.ar') ?? $request->input('problem_ar') ?? '';
        $problemEn = $request->input('problem.en') ?? (is_string($request->input('problem')) ? $request->input('problem') : ($request->input('problem_en') ?? ''));

        $solutionAr = $request->input('solution.ar') ?? $request->input('solution_ar') ?? '';
        $solutionEn = $request->input('solution.en') ?? (is_string($request->input('solution')) ? $request->input('solution') : ($request->input('solution_en') ?? ''));

        $featuresAr = $request->input('features.ar') ?? $request->input('features_ar') ?? [];
        $featuresEn = $request->input('features.en') ?? (is_array($request->input('features')) && ! isset($request->input('features')['ar']) ? $request->input('features') : []);

        $metricsAr = $request->input('metrics.ar') ?? $request->input('metrics_ar') ?? [];
        $metricsEn = $request->input('metrics.en') ?? (is_array($request->input('metrics')) && ! isset($request->input('metrics')['ar']) ? $request->input('metrics') : []);

        $project = Project::create([
            'slug' => $slug,
            'category' => $validated['category'],
            'category_label' => ['ar' => $categoryLabelAr, 'en' => $categoryLabelEn],
            'title' => ['ar' => $titleAr, 'en' => $titleEn],
            'tagline' => ['ar' => $taglineAr, 'en' => $taglineEn],
            'description' => ['ar' => $descriptionAr, 'en' => $descriptionEn],
            'problem' => ['ar' => $problemAr, 'en' => $problemEn],
            'solution' => ['ar' => $solutionAr, 'en' => $solutionEn],
            'features' => ['ar' => (array) $featuresAr, 'en' => (array) $featuresEn],
            'metrics' => ['ar' => (array) $metricsAr, 'en' => (array) $metricsEn],
            'image' => $image,
            'gallery' => $validated['gallery'] ?? [],
            'technologies' => $request->input('technologies', []),
            'client' => $validated['client'] ?? null,
            'live_url' => $validated['live_url'] ?? null,
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'order' => (int) ($validated['order'] ?? 0),
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        // Upload and associate gallery files with display order
        if ($request->hasFile('gallery_files')) {
            $files = $request->file('gallery_files');
            $orders = $request->input('gallery_files_order', []);
            $captionsAr = $request->input('gallery_files_caption_ar', []);
            $captionsEn = $request->input('gallery_files_caption_en', []);

            foreach ($files as $idx => $file) {
                if ($file && $file->isValid()) {
                    $storedPath = $file->store('projects/gallery', 'public');
                    $order = isset($orders[$idx]) && is_numeric($orders[$idx]) ? (int) $orders[$idx] : ($idx + 1);

                    ProjectImage::create([
                        'project_id' => $project->id,
                        'path' => Storage::url($storedPath),
                        'caption' => [
                            'ar' => $captionsAr[$idx] ?? '',
                            'en' => $captionsEn[$idx] ?? '',
                        ],
                        'display_order' => $order,
                    ]);
                }
            }
        }

        // Handle URL-based gallery items if provided
        if ($request->filled('gallery') && is_array($request->input('gallery'))) {
            $existingPaths = $project->images()->pluck('path')->toArray();
            foreach ($request->input('gallery') as $idx => $imgPath) {
                if (is_string($imgPath) && ! empty($imgPath) && ! in_array($imgPath, $existingPaths)) {
                    ProjectImage::create([
                        'project_id' => $project->id,
                        'path' => $imgPath,
                        'caption' => null,
                        'display_order' => $idx + 1,
                    ]);
                }
            }
        }

        // Sync project gallery JSON column with ordered image paths
        $galleryPaths = $project->images()->orderBy('display_order')->pluck('path')->toArray();
        if (! empty($galleryPaths)) {
            $project->update(['gallery' => $galleryPaths]);
        }

        return redirect()->route('projects.index')->with('success', 'Project created successfully.');
    }

    /**
     * Show the form for editing the specified project.
     */
    public function edit(Request $request, Project $project): Response
    {
        Gate::authorize('update', $project);

        return Inertia::render('projects/edit', [
            'project' => $project->load('images'),
            'categories' => $this->getCategories(),
        ]);
    }

    /**
     * Update the specified project in storage.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        Gate::authorize('update', $project);

        $validated = $request->validate([
            'title' => ['nullable'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('projects', 'slug')->ignore($project->id)],
            'category' => ['required', 'string', 'max:100'],
            'category_label' => ['nullable'],
            'category_label_ar' => ['nullable', 'string', 'max:150'],
            'tagline' => ['nullable'],
            'tagline_ar' => ['nullable', 'string'],
            'description' => ['nullable'],
            'description_ar' => ['nullable', 'string'],
            'problem' => ['nullable'],
            'problem_ar' => ['nullable', 'string'],
            'solution' => ['nullable'],
            'solution_ar' => ['nullable', 'string'],
            'image' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:6144'],
            'gallery' => ['nullable', 'array'],
            'gallery_files' => ['nullable', 'array'],
            'gallery_files.*' => ['file', 'image', 'mimes:jpeg,png,jpg,webp', 'max:6144'],
            'technologies' => ['nullable', 'array'],
            'features' => ['nullable'],
            'features_ar' => ['nullable', 'array'],
            'metrics' => ['nullable'],
            'metrics_ar' => ['nullable', 'array'],
            'client' => ['nullable', 'string', 'max:255'],
            'live_url' => ['nullable', 'string', 'max:500'],
            'is_featured' => ['nullable', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $titleAr = $request->input('title.ar') ?? (is_string($request->input('title')) ? $request->input('title') : ($request->input('title_ar') ?? $project->title_ar));
        $titleEn = $request->input('title.en') ?? $request->input('title_en') ?? $project->title_en ?? '';

        $image = $project->image;
        if ($request->hasFile('image_file')) {
            $path = $request->file('image_file')->store('projects', 'public');
            $image = Storage::url($path);
        } elseif (isset($validated['image'])) {
            $image = $validated['image'];
        }

        $categoryLabelAr = $request->input('category_label.ar') ?? $request->input('category_label_ar') ?? $project->category_label_ar ?? '';
        $categoryLabelEn = $request->input('category_label.en') ?? (is_string($request->input('category_label')) ? $request->input('category_label') : ($request->input('category_label_en') ?? $project->category_label_en ?? ''));

        if (empty($categoryLabelAr) || empty($categoryLabelEn)) {
            $catModel = Category::where('slug', $validated['category'])->first();
            if ($catModel) {
                $categoryLabelAr = $categoryLabelAr ?: ($catModel->name_ar ?? '');
                $categoryLabelEn = $categoryLabelEn ?: ($catModel->name_en ?? '');
            }
        }

        $taglineAr = $request->input('tagline.ar') ?? $request->input('tagline_ar') ?? $project->tagline_ar ?? '';
        $taglineEn = $request->input('tagline.en') ?? (is_string($request->input('tagline')) ? $request->input('tagline') : ($request->input('tagline_en') ?? $project->tagline_en ?? ''));

        $descriptionAr = $request->input('description.ar') ?? $request->input('description_ar') ?? $project->description_ar ?? '';
        $descriptionEn = $request->input('description.en') ?? (is_string($request->input('description')) ? $request->input('description') : ($request->input('description_en') ?? $project->description_en ?? ''));

        $problemAr = $request->input('problem.ar') ?? $request->input('problem_ar') ?? $project->problem_ar ?? '';
        $problemEn = $request->input('problem.en') ?? (is_string($request->input('problem')) ? $request->input('problem') : ($request->input('problem_en') ?? $project->problem_en ?? ''));

        $solutionAr = $request->input('solution.ar') ?? $request->input('solution_ar') ?? $project->solution_ar ?? '';
        $solutionEn = $request->input('solution.en') ?? (is_string($request->input('solution')) ? $request->input('solution') : ($request->input('solution_en') ?? $project->solution_en ?? ''));

        $featuresAr = $request->input('features.ar') ?? $request->input('features_ar') ?? $project->features_ar ?? [];
        $featuresEn = $request->input('features.en') ?? (is_array($request->input('features')) && ! isset($request->input('features')['ar']) ? $request->input('features') : ($project->features_en ?? []));

        $metricsAr = $request->input('metrics.ar') ?? $request->input('metrics_ar') ?? $project->metrics_ar ?? [];
        $metricsEn = $request->input('metrics.en') ?? (is_array($request->input('metrics')) && ! isset($request->input('metrics')['ar']) ? $request->input('metrics') : ($project->metrics_en ?? []));

        $project->update([
            'slug' => $validated['slug'],
            'category' => $validated['category'],
            'category_label' => ['ar' => $categoryLabelAr, 'en' => $categoryLabelEn],
            'title' => ['ar' => $titleAr, 'en' => $titleEn],
            'tagline' => ['ar' => $taglineAr, 'en' => $taglineEn],
            'description' => ['ar' => $descriptionAr, 'en' => $descriptionEn],
            'problem' => ['ar' => $problemAr, 'en' => $problemEn],
            'solution' => ['ar' => $solutionAr, 'en' => $solutionEn],
            'features' => ['ar' => (array) $featuresAr, 'en' => (array) $featuresEn],
            'metrics' => ['ar' => (array) $metricsAr, 'en' => (array) $metricsEn],
            'image' => $image,
            'gallery' => $validated['gallery'] ?? $project->gallery,
            'technologies' => $request->input('technologies', $project->technologies),
            'client' => $validated['client'] ?? null,
            'live_url' => $validated['live_url'] ?? null,
            'is_featured' => (bool) ($validated['is_featured'] ?? false),
            'order' => (int) ($validated['order'] ?? 0),
            'updated_by' => $request->user()->id,
        ]);

        // 1. Process existing gallery images (update display_order, captions, or delete)
        if ($request->has('existing_images') && is_array($request->input('existing_images'))) {
            foreach ($request->input('existing_images') as $item) {
                if (! isset($item['id'])) {
                    continue;
                }

                $projectImage = ProjectImage::where('id', $item['id'])
                    ->where('project_id', $project->id)
                    ->first();

                if ($projectImage) {
                    if (! empty($item['_destroy']) || ! empty($item['is_deleted'])) {
                        $projectImage->delete();
                    } else {
                        $updateData = [];
                        if (isset($item['display_order'])) {
                            $updateData['display_order'] = (int) $item['display_order'];
                        }
                        if (array_key_exists('caption_ar', $item) || array_key_exists('caption_en', $item)) {
                            $updateData['caption'] = [
                                'ar' => $item['caption_ar'] ?? ($projectImage->caption['ar'] ?? ''),
                                'en' => $item['caption_en'] ?? ($projectImage->caption['en'] ?? ''),
                            ];
                        }
                        if (! empty($updateData)) {
                            $projectImage->update($updateData);
                        }
                    }
                }
            }
        }

        // 2. Process newly uploaded gallery files
        if ($request->hasFile('gallery_files')) {
            $files = $request->file('gallery_files');
            $orders = $request->input('gallery_files_order', []);
            $captionsAr = $request->input('gallery_files_caption_ar', []);
            $captionsEn = $request->input('gallery_files_caption_en', []);

            $maxOrder = (int) ($project->images()->max('display_order') ?? 0);

            foreach ($files as $idx => $file) {
                if ($file && $file->isValid()) {
                    $storedPath = $file->store('projects/gallery', 'public');
                    $order = isset($orders[$idx]) && is_numeric($orders[$idx])
                        ? (int) $orders[$idx]
                        : ($maxOrder + $idx + 1);

                    ProjectImage::create([
                        'project_id' => $project->id,
                        'path' => Storage::url($storedPath),
                        'caption' => [
                            'ar' => $captionsAr[$idx] ?? '',
                            'en' => $captionsEn[$idx] ?? '',
                        ],
                        'display_order' => $order,
                    ]);
                }
            }
        }

        // 3. Keep JSON gallery array in sync with sorted images
        $galleryPaths = $project->images()->orderBy('display_order')->pluck('path')->toArray();
        if (! empty($galleryPaths)) {
            $project->update(['gallery' => $galleryPaths]);
        }

        return redirect()->route('projects.index')->with('success', 'Project updated successfully.');
    }

    /**
     * Remove the specified project from storage.
     */
    public function destroy(Request $request, Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);

        $project->delete();

        return redirect()->route('projects.index')->with('success', 'Project deleted successfully.');
    }

    /**
     * Delete an individual gallery image from a project.
     */
    public function destroyImage(Project $project, ProjectImage $image): RedirectResponse
    {
        Gate::authorize('update', $project);

        if ($image->project_id === $project->id) {
            if ($image->path) {
                $urlPath = parse_url($image->path, PHP_URL_PATH);
                if (is_string($urlPath)) {
                    $relativePath = str_replace('/storage/', '', $urlPath);
                    if ($relativePath && Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }
            }
            $image->delete();
            $galleryPaths = $project->images()->orderBy('display_order')->pluck('path')->toArray();
            $project->update(['gallery' => $galleryPaths]);
        }

        return back()->with('success', 'Image removed from gallery.');
    }
}
