<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titleEn = fake()->sentence(3);

        return [
            'slug' => Str::slug($titleEn).'-'.Str::random(4),
            'category' => fake()->randomElement(['web', 'mobile', 'erp']),
            'category_label' => [
                'ar' => 'تطوير برمجيات',
                'en' => fake()->randomElement(['Web & Portals', 'Mobile Systems', 'ERP & Cloud']),
            ],
            'title' => [
                'ar' => 'مشروع تجريبي '.fake()->word(),
                'en' => $titleEn,
            ],
            'tagline' => [
                'ar' => 'وصف تسويقي للمشروع التجريبي',
                'en' => fake()->sentence(),
            ],
            'description' => [
                'ar' => 'تفاصيل المشروع ونظرة عامة على الحلول التقنية المقدمة.',
                'en' => fake()->paragraph(),
            ],
            'problem' => [
                'ar' => 'المشكلة التي يحلها المشروع.',
                'en' => fake()->paragraph(),
            ],
            'solution' => [
                'ar' => 'الحل المقدم للعميل.',
                'en' => fake()->paragraph(),
            ],
            'image' => '/images/projects/master shop.jpg.jpeg',
            'gallery' => ['/images/projects/master shop.jpg.jpeg'],
            'technologies' => ['React', 'Laravel', 'TailwindCSS'],
            'metrics' => [
                'ar' => [
                    ['label' => 'الأداء', 'val' => '99.9%'],
                    ['label' => 'المستخدمين', 'val' => '10K+'],
                ],
                'en' => [
                    ['label' => 'Performance', 'val' => '99.9%'],
                    ['label' => 'Users', 'val' => '10K+'],
                ],
            ],
            'features' => [
                'ar' => ['تسجيل دخول سريع', 'مزامنة فورية', 'متوافق مع الهواتف'],
                'en' => ['Fast authentication', 'Real-time sync', 'Mobile responsive'],
            ],
            'client' => fake()->company(),
            'live_url' => fake()->url(),
            'is_featured' => fake()->boolean(40),
            'order' => fake()->numberBetween(0, 10),
            'created_by' => User::factory(),
            'updated_by' => null,
        ];
    }
}
