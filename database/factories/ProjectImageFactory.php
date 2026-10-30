<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\ProjectImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectImage>
 */
class ProjectImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'path' => '/images/projects/master shop.jpg.jpeg',
            'caption' => [
                'ar' => 'صورة للمشروع',
                'en' => 'Project preview',
            ],
            'display_order' => 1,
        ];
    }
}
