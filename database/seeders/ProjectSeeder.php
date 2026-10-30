<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $creator = User::first();
        $creatorId = $creator?->id;

        $projects = [
            [
                'slug' => 'master-shop-marketplace',
                'category' => 'mobile',
                'category_label' => [
                    'ar' => 'أنظمة وتطبيقات الجوال',
                    'en' => 'Mobile Systems',
                ],
                'title' => [
                    'ar' => 'ماستر شوب — تطبيق خدمات وتوصيل متكامل',
                    'en' => 'Master shop — Multi-Service Delivery Marketplace',
                ],
                'tagline' => [
                    'ar' => 'تطبيق واحد يجمع أربعة قطاعات خدمية — بقالة، مطاعم، غسيل سيارات، وتوصيل سريع.',
                    'en' => 'One app, four service verticals — groceries, restaurants, car wash and express courier.',
                ],
                'description' => [
                    'ar' => 'تطبيق سوق إلكتروني موجه باللغة العربية أولاً يجمع البقالة والمطاعم وغسيل السيارات والتوصيل السريع في تجربة طلب واحدة.',
                    'en' => 'A native Arabic-first marketplace app bringing groceries, restaurants, car wash and express delivery into a single ordering experience, with live location-based storefronts and Google sign-in.',
                ],
                'problem' => [
                    'ar' => 'كان العميل يدير خطوط خدمة منفصلة دون واجهة رقمية موحدة للعملاء.',
                    'en' => 'The client ran several separate service lines with no shared digital front door — customers had to know which brand to contact for which service, and there was no single place to see live offers across all of them.',
                ],
                'solution' => [
                    'ar' => 'قمنا ببناء تطبيق أصلي بحساب موحد وسلة مشتريات مشتركة تغطي جميع قطاعات الخدمة مع نظام دفع وتتبع متقدم.',
                    'en' => 'We built one native app with a shared account and cart system, where each service vertical lives behind its own category tile but shares checkout, location and notifications. Onboarding and every screen were designed RTL-first in Arabic, with Google sign-in for fast account creation.',
                ],
                'image' => '/images/projects/master shop.jpg.jpeg',
                'gallery' => ['/images/projects/master shop.jpg.jpeg'],
                'technologies' => ['Flutter', 'Firebase Auth', 'Google Places API', 'Node.js'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'قطاعات الخدمة', 'val' => '4 في تطبيق واحد'],
                        ['label' => 'الواجهة', 'val' => 'عربية أصلية'],
                        ['label' => 'تسجيل الدخول', 'val' => 'جوجل الموحد'],
                    ],
                    'en' => [
                        ['label' => 'Service verticals', 'val' => '4 in one app'],
                        ['label' => 'Interface', 'val' => 'Arabic RTL-native'],
                        ['label' => 'Sign-in', 'val' => 'Google OAuth'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'حساب وسلة دفع موحدة عبر كافة القطاعات الخدمية',
                        'تحديد موقع فوري مع تقدير وقت وتكلفة التوصيل',
                        'عروض ترويجية مخصصة ومحدثة لحظياً على الواجهة الرئيسية',
                    ],
                    'en' => [
                        'Unified account, cart and checkout across four independent service verticals',
                        'Live location detection with address-based storefront and delivery estimation',
                        'Weekend and category-specific promotions surfaced directly on the home feed',
                    ],
                ],
                'client' => 'Master Shop Co.',
                'live_url' => 'https://mastershop.app',
                'is_featured' => true,
                'order' => 1,
            ],
            [
                'slug' => 'bayoo-marketplace',
                'category' => 'mobile',
                'category_label' => [
                    'ar' => 'أنظمة وتطبيقات الجوال',
                    'en' => 'Mobile Systems',
                ],
                'title' => [
                    'ar' => 'بيوع — منصة إعلانات مبوبة لمدينة السادات',
                    'en' => "Bayoo' — Sadat City Classifieds Marketplace",
                ],
                'tagline' => [
                    'ar' => 'تطبيق إعلانات مبوبة محلي منظم حسب الفئات — مركبات، عقارات، خدمات وغيرها.',
                    'en' => 'A local classifieds app organized by category — vehicles, real estate, services and more.',
                ],
                'description' => [
                    'ar' => 'منصة سوق إعلانات مبوبة أصلية لسكان مدينة السادات لنشر وتصفح الإعلانات بسهولة.',
                    'en' => 'A native classifieds marketplace built for Sadat City, letting residents browse and post listings across categories like vehicles, real estate, services, and pets, entirely in Arabic with phone-based sign-up.',
                ],
                'problem' => [
                    'ar' => 'كانت الإعلانات مشتتة بين مجموعات التواصل الاجتماعي بدون منصة منظمة.',
                    'en' => 'Local classifieds were scattered across social media groups and word of mouth, with no dedicated place to browse listings.',
                ],
                'solution' => [
                    'ar' => 'صممنا تطبيقاً مبتكراً بواجهة شبكية أنيقة وتدفق سلس لنشر الإعلانات وتصنيفها.',
                    'en' => 'We built a native app with a clean category grid, phone-number sign-up with a local country-code default, and a guided listing flow.',
                ],
                'image' => '/images/projects/takween.jpg.jpeg',
                'gallery' => ['/images/projects/takween.jpg.jpeg'],
                'technologies' => ['Flutter', 'REST API', 'MySQL'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'الأقسام', 'val' => 'أكثر من 6 أقسام'],
                        ['label' => 'التسجيل', 'val' => 'برقم الهاتف'],
                    ],
                    'en' => [
                        ['label' => 'Categories', 'val' => '6+ browsable'],
                        ['label' => 'Sign-up', 'val' => 'Phone-based'],
                        ['label' => 'Core flow', 'val' => 'Post listing in a few taps'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'تصنيف شامل للمركبات والعقارات والخدمات والحيوانات الأليفة',
                        'تسجيل سلس برقم الهاتف مع التحقق السريع',
                        'إدارة شاملة للإعلانات المنشورة وتحديث حالتها',
                    ],
                    'en' => [
                        'Category grid covering vehicles, real estate, services, and pets',
                        'Phone-number registration with country-code selector',
                        'Dedicated add-listing and my-listings management',
                    ],
                ],
                'client' => 'Bayoo Sadat',
                'live_url' => 'https://bayoo.app',
                'is_featured' => true,
                'order' => 2,
            ],
            [
                'slug' => 'libya-interior-media-office',
                'category' => 'web',
                'category_label' => [
                    'ar' => 'بوابة حكومية رسمية',
                    'en' => 'Government Web Portal',
                ],
                'title' => [
                    'ar' => 'الموقع الرسمي لمكتب الإعلام الأمني — وزارة الداخلية الليبية',
                    'en' => 'Libyan Ministry of Interior — Security Media Office Portal',
                ],
                'tagline' => [
                    'ar' => 'بوابة معلومات عامة منظمة تضم الأخبار وقنوات التواصل والإبلاغ عن الحوادث.',
                    'en' => 'A structured public information portal with news, contact and incident-reporting channels.',
                ],
                'description' => [
                    'ar' => 'منصة رسمية لمكتب الإعلام الأمني بوزارة الداخلية لتنظيم الأخبار والبيانات والخدمات الموجهة للجمهور.',
                    'en' => 'A public information platform for the Ministry Security Media Office, organizing ministry news, directorates and public-facing services.',
                ],
                'problem' => [
                    'ar' => 'الحاجة لمنصة رسمية موثوقة تجمع قنوات التواصل الرسمية وتكافح الشائعات.',
                    'en' => 'The Ministry needed a single, organized public entry point where citizens could reach official services and news.',
                ],
                'solution' => [
                    'ar' => 'تطوير بوابة إلكترونية آمنة وسريعة مع قنوات تفاعلية للإبلاغ والتواصل المباشر.',
                    'en' => 'We delivered a content-structured portal with a clear navigation hierarchy plus dedicated forms for incident and cybercrime reporting.',
                ],
                'image' => '/images/projects/offoq_page-0001.jpg.jpeg',
                'gallery' => ['/images/projects/offoq_page-0001.jpg.jpeg'],
                'technologies' => ['Laravel', 'React', 'TailwindCSS'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'هيكل الموقع', 'val' => 'هيكل وزاري متكامل'],
                        ['label' => 'قنوات الجمهور', 'val' => 'تواصل وبلاغات أمنية'],
                    ],
                    'en' => [
                        ['label' => 'Site structure', 'val' => 'Full ministry hierarchy'],
                        ['label' => 'Public channels', 'val' => 'Contact, incident reporting'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'تصفح منظم عبر قطاعات وإدارات الوزارة',
                        'نماذج إلكترونية للتواصل المباشر مع المكتب الإعلامي',
                        'قنوات مخصصة للإبلاغ عن الجرائم الإلكترونية والمفقودين',
                    ],
                    'en' => [
                        'Structured public navigation across ministry sections and directorates',
                        'Dedicated contact form routed directly to the Media Office',
                        'Public channels for reporting cybercrime incidents',
                    ],
                ],
                'client' => 'Libyan Ministry of Interior',
                'live_url' => 'https://moi.gov.ly',
                'is_featured' => true,
                'order' => 3,
            ],
            [
                'slug' => 'yourz-partner-sellers',
                'category' => 'mobile',
                'category_label' => [
                    'ar' => 'أنظمة وتطبيقات الجوال',
                    'en' => 'Mobile Systems',
                ],
                'title' => [
                    'ar' => 'يورز — تطبيق الشركاء والتجار',
                    'en' => 'Yourz — Partner & Merchant Portal',
                ],
                'tagline' => [
                    'ar' => 'أداة تشغيلية مخصصة للتجار لإدارة كتالوج المنتجات والطلبات وتسليم الشحنات.',
                    'en' => 'A dedicated operational tool for sellers to manage catalog, orders, and delivery handoffs.',
                ],
                'description' => [
                    'ar' => 'تطبيق جوال للتجار يتيح إدارة الفروع والمنتجات والطلبات المباشرة بدقة وكفاءة.',
                    'en' => 'A merchant mobile app designed for sellers operating within an on-demand delivery network.',
                ],
                'problem' => [
                    'ar' => 'صعوبة تتبع الطلبات الواردة لحظياً وتحديث حالة المخزون لدى التجار.',
                    'en' => 'Merchants lacked real-time visibility into incoming orders and stock readiness.',
                ],
                'solution' => [
                    'ar' => 'بناء تطبيق لوحة تحكم سريع مع تنبيهات صوتية للطلبات وتحديث بلمسة واحدة.',
                    'en' => 'Built an intuitive dashboard app with audible order alerts and 1-tap status updates.',
                ],
                'image' => '/images/projects/yourz.jpg.jpeg',
                'gallery' => ['/images/projects/yourz.jpg.jpeg'],
                'technologies' => ['React Native', 'WebSockets', 'TailwindCSS'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'سرعة تجهيز الطلب', 'val' => 'أقل من 45 ثانية'],
                        ['label' => 'مزامنة الكتالوج', 'val' => 'لحظية'],
                    ],
                    'en' => [
                        ['label' => 'Order processing', 'val' => '< 45s avg'],
                        ['label' => 'Catalog sync', 'val' => 'Instant'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'تنبيهات صوتية فورية للطلبات الجديدة',
                        'إيقاف وتفعيل المنتجات حسب توفر المخزون بلمسة واحدة',
                        'إحصائيات مالية دقيقة للإيرادات اليومية والأسبوعية',
                    ],
                    'en' => [
                        'Instant push and audible alerts for new orders',
                        'Fast catalog toggle for out-of-stock items',
                        'Daily and weekly revenue analytics',
                    ],
                ],
                'client' => 'Yourz Delivery',
                'live_url' => 'https://yourz.app',
                'is_featured' => false,
                'order' => 4,
            ],
            [
                'slug' => 'tharaa-al-ilm-academy',
                'category' => 'web',
                'category_label' => [
                    'ar' => 'منصة تعليمية إلكترونية',
                    'en' => 'Education Web Platform',
                ],
                'title' => [
                    'ar' => 'أكاديمية ثراء العلم — منصة التعليم والتدريب التفاعلي',
                    'en' => 'Tharaa Al-Ilm Academy — Interactive Learning Platform',
                ],
                'tagline' => [
                    'ar' => 'منصة إدارة تعلم ديناميكية للدورات التدريبية وتقييم الطلاب والورش التفاعلية.',
                    'en' => 'A dynamic LMS platform for online courses, student grading, and live workshops.',
                ],
                'description' => [
                    'ar' => 'منصة تعليمية شاملة للمناهج والاختبارات القصيرة والبث المباشر للمحاضرات.',
                    'en' => 'An educational platform offering structured curricula, quizzes, and live webinars.',
                ],
                'problem' => [
                    'ar' => 'صعوبة إدارة تسجيل الطلاب وتوزيع المواد التعليمية بصورة يدوية.',
                    'en' => 'Manual enrollment processes and fragmented workshop delivery caused delays.',
                ],
                'solution' => [
                    'ar' => 'تطوير منصة تعليمية ذكية تدعم بث الفيديو وإصدار الشهادات الإلكترونية المعتمدة.',
                    'en' => 'Developed an automated LMS with integrated video streaming and automated certificate issuance.',
                ],
                'image' => '/images/projects/takween.jpg.jpeg',
                'gallery' => ['/images/projects/takween.jpg.jpeg'],
                'technologies' => ['Next.js', 'PostgreSQL', 'Stripe'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'الطلاب النشطين', 'val' => 'أكثر من 5,000'],
                        ['label' => 'نسبة إكمال الدورات', 'val' => '88%'],
                    ],
                    'en' => [
                        ['label' => 'Active Students', 'val' => '5,000+'],
                        ['label' => 'Course Completion', 'val' => '88%'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'مشغل فيديو تفاعلي مع أسئلة تقييمية أثناء المشاهدة',
                        'إصدار فوري لشهادات التخرج الرقمية',
                        'لوحة تحكم للمحاضرين لمتابعة أداء وتقدم الطلاب',
                    ],
                    'en' => [
                        'Interactive video player with quiz checkpoints',
                        'Automated PDF certificate generation',
                        'Instructor dashboard with student progress tracking',
                    ],
                ],
                'client' => 'Tharaa Al-Ilm Academy',
                'live_url' => 'https://tharaa.academy',
                'is_featured' => false,
                'order' => 5,
            ],
            [
                'slug' => 'takween-library',
                'category' => 'web',
                'category_label' => [
                    'ar' => 'بوابة تجارة إلكترونية للكتب',
                    'en' => 'E-Commerce Web Portal',
                ],
                'title' => [
                    'ar' => 'مكتبة تكوين — منصة بيع وشحن الكتب الورقية والرقمية',
                    'en' => 'Takween Bookstore — Online Book & Publishing Portal',
                ],
                'tagline' => [
                    'ar' => 'متجر إلكتروني متقدم للكتب الورقية والرقمية مع ميزة معاينة القراءة والشحن السريع.',
                    'en' => 'A high-performance bookstore with advanced search, reading previews, and courier integration.',
                ],
                'description' => [
                    'ar' => 'منصة تسوق متخصصة للكتب تدعم معاينة الفصول، تقييمات القراء، والشحن الدولي.',
                    'en' => 'An e-commerce platform built specifically for book readers and publishers.',
                ],
                'problem' => [
                    'ar' => 'حاجة القراء لمعاينة الكتب قبل الشراء وحاجة المؤلفين لمتابعة مبيعاتهم بدقة.',
                    'en' => 'Readers needed preview chapters and authors wanted royalties dashboards.',
                ],
                'solution' => [
                    'ar' => 'تطوير متجر سريع مع قارئ تفاعلي للفصول وربط برمجي مع شركات الشحن.',
                    'en' => 'Created an interactive book browser with chapter previews and automated courier dispatch.',
                ],
                'image' => '/images/projects/takween.jpg.jpeg',
                'gallery' => ['/images/projects/takween.jpg.jpeg'],
                'technologies' => ['React', 'Laravel', 'Elasticsearch'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'عناوين الكتب', 'val' => 'أكثر من 12,000'],
                        ['label' => 'الطلبات الشهرية', 'val' => '3,500+'],
                    ],
                    'en' => [
                        ['label' => 'Titles Available', 'val' => '12,000+'],
                        ['label' => 'Monthly Orders', 'val' => '3,500+'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'قارئ إلكتروني مدمج لمعاينة عينة من كل كتاب',
                        'محرك ترشيحات ذكي مبني على اهتمامات القارئ',
                        'إصدار بوليصات الشحن تلقائياً عند تأكيد الطلب',
                    ],
                    'en' => [
                        'Instant chapter preview viewer',
                        'Smart recommendations by reading history',
                        'Automated courier shipping label generation',
                    ],
                ],
                'client' => 'Takween Publishing House',
                'live_url' => 'https://takween.books',
                'is_featured' => true,
                'order' => 6,
            ],
            [
                'slug' => 'mashwar-al-asema',
                'category' => 'erp',
                'category_label' => [
                    'ar' => 'الأنظمة السحابية وإدارة الأساطيل',
                    'en' => 'ERP & Cloud',
                ],
                'title' => [
                    'ar' => 'مشوار العاصمة — نظام إدارة النقل والأسطول السحابي',
                    'en' => 'Mashwar Al-Asema — Cloud Fleet & Transport Management',
                ],
                'tagline' => [
                    'ar' => 'نظام سحابي لإدارة وتتبع أساطيل النقل، الوقود، الصيانة الدورية ومؤشرات السائقين.',
                    'en' => 'Enterprise fleet dispatch, fuel tracking, maintenance scheduling and driver metrics.',
                ],
                'description' => [
                    'ar' => 'نظام مؤسسي سحابي لإدارة حركة المركبات والصيانة الدورية وحساب تكاليف التشغيل.',
                    'en' => 'A robust cloud ERP platform tracking fleet operations across nationwide transit routes.',
                ],
                'problem' => [
                    'ar' => 'فقدان البيانات في السجلات الورقية وصعوبة مراقبة استهلاك الوقود ومواعيد الصيانة.',
                    'en' => 'Manual logs caused fuel loss, delayed maintenance, and untracked driver schedules.',
                ],
                'solution' => [
                    'ar' => 'تطبيق حلول التتبع الجغرافي الفوري، وجدولة الصيانة الوقائية، ومؤشرات الأداء.',
                    'en' => 'Implemented real-time GPS telemetry, maintenance alerts, and driver rating metrics.',
                ],
                'image' => '/images/projects/master shop.jpg.jpeg',
                'gallery' => ['/images/projects/master shop.jpg.jpeg'],
                'technologies' => ['React', 'Laravel', 'Docker', 'PostgreSQL'],
                'metrics' => [
                    'ar' => [
                        ['label' => 'حجم الأسطول', 'val' => '350+ مركبة'],
                        ['label' => 'توفير استهلاك الوقود', 'val' => '18% سنوياً'],
                    ],
                    'en' => [
                        ['label' => 'Fleet Size', 'val' => '350+ vehicles'],
                        ['label' => 'Fuel Savings', 'val' => '18% YoY'],
                    ],
                ],
                'features' => [
                    'ar' => [
                        'تتبع جغرافي لحظي للمركبات على خرائط مخصصة',
                        'تنبيهات صيانة وقائية ذكية حسب قراءة العداد',
                        'بطاقات أداء وتقييم دوري للسائقين',
                    ],
                    'en' => [
                        'Live GPS fleet monitoring on custom map layers',
                        'Predictive maintenance alerts based on odometer reading',
                        'Driver performance scorecards and violation logs',
                    ],
                ],
                'client' => 'Mashwar Logistics',
                'live_url' => 'https://mashwar.transport',
                'is_featured' => true,
                'order' => 7,
            ],
        ];

        foreach ($projects as $data) {
            $gallery = $data['gallery'] ?? [];
            $project = Project::updateOrCreate(
                ['slug' => $data['slug']],
                array_merge($data, [
                    'created_by' => $creatorId,
                    'updated_by' => $creatorId,
                ])
            );

            // Populate relational project images with display order
            $project->images()->delete();
            $order = 1;
            foreach ($gallery as $imgPath) {
                ProjectImage::create([
                    'project_id' => $project->id,
                    'path' => $imgPath,
                    'caption' => [
                        'ar' => ($project->title['ar'] ?? 'صورة للمشروع').' - صورة '.$order,
                        'en' => ($project->title['en'] ?? 'Project Image').' - preview '.$order,
                    ],
                    'display_order' => $order++,
                ]);
            }
        }
    }
}
