<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $englishName = fake()->unique()->words(2, true);

        return [
            'slug' => Str::slug($englishName),
            'name' => [
                'en' => ucfirst($englishName),
                'ar' => 'تصنيف '.fake()->word(),
            ],
            'description' => [
                'en' => fake()->sentence(),
                'ar' => 'وصف تجريبي للتصنيف باللغة العربية.',
            ],
            'order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }
}
