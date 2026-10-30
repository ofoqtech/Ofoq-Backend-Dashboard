<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'slug' => 'web',
                'name' => [
                    'en' => 'Web & Portals',
                    'ar' => 'بوابات وتطبيقات الويب',
                ],
                'description' => [
                    'en' => 'Modern responsive web applications, client portals, and SaaS software.',
                    'ar' => 'تطبيقات الويب المتجاوبة والبوابات الإلكترونية والمنصات السحابية الحديثة.',
                ],
                'order' => 1,
                'is_active' => true,
            ],
            [
                'slug' => 'mobile',
                'name' => [
                    'en' => 'Mobile Systems',
                    'ar' => 'أنظمة وتطبيقات الجوال',
                ],
                'description' => [
                    'en' => 'Native iOS, Android, and cross-platform Flutter/React Native mobile applications.',
                    'ar' => 'تطبيقات الهواتف الذكية المبتكرة لنظامي iOS وأندرويد باستخدام أحدث التقنيات.',
                ],
                'order' => 2,
                'is_active' => true,
            ],
            [
                'slug' => 'erp',
                'name' => [
                    'en' => 'ERP & Cloud',
                    'ar' => 'الأنظمة الإدارية والسحابية',
                ],
                'description' => [
                    'en' => 'Custom enterprise resource planning, business automation, and cloud management systems.',
                    'ar' => 'أنظمة تخطيط الموارد المؤسسية وحلول الأتمتة الإدارية والبنية السحابية المتكاملة.',
                ],
                'order' => 3,
                'is_active' => true,
            ],
            [
                'slug' => 'ecommerce',
                'name' => [
                    'en' => 'E-Commerce Platforms',
                    'ar' => 'متاجر ومنصات التجارة الإلكترونية',
                ],
                'description' => [
                    'en' => 'Digital storefronts, online shopping platforms, and integrated payment systems.',
                    'ar' => 'متاجر رقمية متكاملة ومنصات بيع إلكتروني مدعومة ببوابات دفع إلكتروني آمنة.',
                ],
                'order' => 4,
                'is_active' => true,
            ],
            [
                'slug' => 'ai',
                'name' => [
                    'en' => 'AI & Smart Systems',
                    'ar' => 'أنظمة الذكاء الاصطناعي والأتمتة',
                ],
                'description' => [
                    'en' => 'Artificial intelligence integration, data intelligence, and autonomous workflows.',
                    'ar' => 'حلول الذكاء الاصطناعي التوليدي وتحليل البيانات والأتمتة الذكية للعمليات.',
                ],
                'order' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(
                ['slug' => $cat['slug']],
                $cat
            );
        }
    }
}
