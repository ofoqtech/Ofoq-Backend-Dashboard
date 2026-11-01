<?php

namespace Database\Seeders;

use App\Models\Service;
use App\Models\ServiceBudget;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'slug' => 'web-development',
                'name' => [
                    'en' => 'Web Development & Platforms',
                    'ar' => 'تطوير المواقع والمنصات السحابية',
                ],
                'description' => [
                    'en' => 'Modern, scalable web applications, e-commerce, and high-performance cloud platforms.',
                    'ar' => 'تطبيقات ومواقع حديثة وقابلة للتوسع ومتاجر إلكترونية وحلول سحابية متقدمة.',
                ],
                'icon' => 'globe',
                'order' => 1,
                'is_active' => true,
                'budgets' => [
                    [
                        'tier_key' => 'starter',
                        'type' => [
                            'en' => 'Starter Website / MVP',
                            'ar' => 'موقع تعريفي / نموذج أولي',
                        ],
                        'range' => '$500 - $1,500 (15,000 - 45,000 EGP)',
                        'description' => [
                            'en' => 'High-conversion landing page or basic corporate website with CMS.',
                            'ar' => 'صفحة هبوط تسويقية أو موقع تعريفي للشركات بلوحة تحكم متكاملة.',
                        ],
                        'order' => 1,
                    ],
                    [
                        'tier_key' => 'growth',
                        'type' => [
                            'en' => 'Business Platform / E-Commerce',
                            'ar' => 'منصة أعمال / متجر إلكتروني متكامل',
                        ],
                        'range' => '$2,000 - $5,000 (60,000 - 150,000 EGP)',
                        'description' => [
                            'en' => 'Full-featured web application, payment gateways, and custom backend.',
                            'ar' => 'تطبيق ويب متكامل مع بوابات الدفع الإلكتروني ولوحة تحكم مخصصة.',
                        ],
                        'order' => 2,
                    ],
                    [
                        'tier_key' => 'enterprise',
                        'type' => [
                            'en' => 'Enterprise Cloud System',
                            'ar' => 'نظام سحابي مؤسسي ضخم',
                        ],
                        'range' => '$6,000+ (180,000+ EGP)',
                        'description' => [
                            'en' => 'High-traffic SaaS, microservices, complex integrations, and dedicated SLAs.',
                            'ar' => 'أنظمة SaaS وبنية سحابية معقدة وتكاملات متقدمة لأعلى درجات الأداء والأمان.',
                        ],
                        'order' => 3,
                    ],
                ],
            ],
            [
                'slug' => 'mobile-apps',
                'name' => [
                    'en' => 'Mobile App Development',
                    'ar' => 'تطوير تطبيقات الهواتف الذكية',
                ],
                'description' => [
                    'en' => 'Native and cross-platform iOS & Android mobile applications built for peak performance.',
                    'ar' => 'تطبيقات الهواتف الذكية لنظامي iOS وأندرويد بأعلى معايير السرعة والتصميم العصري.',
                ],
                'icon' => 'smartphone',
                'order' => 2,
                'is_active' => true,
                'budgets' => [
                    [
                        'tier_key' => 'mvp_mobile',
                        'type' => [
                            'en' => 'MVP Mobile Application',
                            'ar' => 'نموذج أولي للتطبيق (MVP)',
                        ],
                        'range' => '$1,500 - $3,500 (45,000 - 100,000 EGP)',
                        'description' => [
                            'en' => 'Essential features on iOS & Android for product validation.',
                            'ar' => 'الميزات الأساسية على النظامين للتحقق السريع من نجاح فكرة المشروع في السوق.',
                        ],
                        'order' => 1,
                    ],
                    [
                        'tier_key' => 'full_mobile',
                        'type' => [
                            'en' => 'Commercial Mobile App',
                            'ar' => 'تطبيق تجاري متكامل',
                        ],
                        'range' => '$4,000 - $8,000 (120,000 - 240,000 EGP)',
                        'description' => [
                            'en' => 'Push notifications, payments, geolocation, realtime chat, and analytics.',
                            'ar' => 'إشعارات لحظية، بوابات دفع، تتبع خرائط، دردشة وميزات متقدمة.',
                        ],
                        'order' => 2,
                    ],
                    [
                        'tier_key' => 'enterprise_mobile',
                        'type' => [
                            'en' => 'Enterprise Ecosystem App',
                            'ar' => 'منظومة تطبيقات مؤسسية متكاملة',
                        ],
                        'range' => '$9,000+ (270,000+ EGP)',
                        'description' => [
                            'en' => 'Customer app + Delivery/Staff app + Admin portal + Realtime logistics.',
                            'ar' => 'تطبيق العميل + تطبيق المناديب/الموظفين + لوحة إدارة وتتبع لوجستي متزامن.',
                        ],
                        'order' => 3,
                    ],
                ],
            ],
            [
                'slug' => 'erp-systems',
                'name' => [
                    'en' => 'ERP & Enterprise Solutions',
                    'ar' => 'نظم تخطيط المؤسسات (ERP)',
                ],
                'description' => [
                    'en' => 'Tailored ERP, accounting, inventory, HR, and supply chain software for thriving companies.',
                    'ar' => 'برمجيات مخصصة لإدارة الحسابات، المخازن، المشتريات، المبيعات والموارد البشرية.',
                ],
                'icon' => 'server',
                'order' => 3,
                'is_active' => true,
                'budgets' => [
                    [
                        'tier_key' => 'single_module',
                        'type' => [
                            'en' => 'Departmental Module (Inventory/HR)',
                            'ar' => 'نظام قسم واحد (مخازن أو شؤون موظفين)',
                        ],
                        'range' => '$2,500 - $5,000 (75,000 - 150,000 EGP)',
                        'description' => [
                            'en' => 'Targeted workflow automation for a specific department.',
                            'ar' => 'أتمتة دورة عمل محددة مع تقارير دقيقة ومؤشرات أداء مخصصة.',
                        ],
                        'order' => 1,
                    ],
                    [
                        'tier_key' => 'complete_erp',
                        'type' => [
                            'en' => 'Complete Business ERP',
                            'ar' => 'نظام ERP أعمال شامل',
                        ],
                        'range' => '$6,000 - $12,000 (180,000 - 360,000 EGP)',
                        'description' => [
                            'en' => 'Unified accounting, invoicing, CRM, inventory, and analytics.',
                            'ar' => 'ربط مالي ومخزني وإداري متكامل مع الفاتورة الإلكترونية والتقارير الرقابية.',
                        ],
                        'order' => 2,
                    ],
                    [
                        'tier_key' => 'custom_enterprise',
                        'type' => [
                            'en' => 'Tailored Corporate Ecosystem',
                            'ar' => 'منظومة برمجية مؤسسية مخصصة',
                        ],
                        'range' => '$15,000+ (450,000+ EGP)',
                        'description' => [
                            'en' => 'Multi-branch, localized compliance, AI forecasting, and on-premise/hybrid setup.',
                            'ar' => 'تعدد فروع وعملات، امتثال ضريبي محلي، وتنبؤ ذكي للمبيعات وتدريب فريق العمل.',
                        ],
                        'order' => 3,
                    ],
                ],
            ],
            [
                'slug' => 'ai-automation',
                'name' => [
                    'en' => 'AI Solutions & Automation',
                    'ar' => 'حلول الذكاء الاصطناعي والأتمتة',
                ],
                'description' => [
                    'en' => 'AI-powered agents, customer support automation, computer vision, and predictive workflows.',
                    'ar' => 'مساعدات ذكاء اصطناعي، شات بوت ذكي، أتمتة المستندات وتحليلات بيانات تنبؤية.',
                ],
                'icon' => 'sparkles',
                'order' => 4,
                'is_active' => true,
                'budgets' => [
                    [
                        'tier_key' => 'ai_assistant',
                        'type' => [
                            'en' => 'Smart AI Customer Support Bot',
                            'ar' => 'مساعد دعم عملاء ذكي بالذكاء الاصطناعي',
                        ],
                        'range' => '$1,200 - $3,000 (35,000 - 90,000 EGP)',
                        'description' => [
                            'en' => 'WhatsApp & Web AI agent trained on your company knowledge base.',
                            'ar' => 'روبوت محادثة ذكي على واتساب والويب مدرب على بيانات ومنتجات شركتك بدقة فائقة.',
                        ],
                        'order' => 1,
                    ],
                    [
                        'tier_key' => 'workflow_ai',
                        'type' => [
                            'en' => 'Intelligent Workflow Automation',
                            'ar' => 'أتمتة سير العمل والمستندات الذكية',
                        ],
                        'range' => '$3,500 - $7,000 (100,000 - 210,000 EGP)',
                        'description' => [
                            'en' => 'Automated data extraction from invoices/documents and CRM syncing.',
                            'ar' => 'استخراج بيانات المستندات والفواتير آلياً ومزامنتها لحظياً مع قواعد البيانات.',
                        ],
                        'order' => 2,
                    ],
                    [
                        'tier_key' => 'custom_llm',
                        'type' => [
                            'en' => 'Custom AI Models & Agents',
                            'ar' => 'نماذج ووكلاء ذكاء اصطناعي مخصصة',
                        ],
                        'range' => '$8,000+ (240,000+ EGP)',
                        'description' => [
                            'en' => 'Fine-tuned LLMs, private deployments, and autonomous multi-agent pipelines.',
                            'ar' => 'نماذج ذكاء اصطناعي مدربة محلياً وبنية عمل ذاتية التوجيه للأعمال المعقدة.',
                        ],
                        'order' => 3,
                    ],
                ],
            ],
            [
                'slug' => 'ui-ux-design',
                'name' => [
                    'en' => 'UI/UX Design & Branding',
                    'ar' => 'تصميم واجهات وتجربة المستخدم',
                ],
                'description' => [
                    'en' => 'World-class product design, wireframing, design systems, and digital branding.',
                    'ar' => 'تصاميم واجهات احترافية ومبتكرة، دراسة تجربة المستخدم وهويات رقمية جاذبة.',
                ],
                'icon' => 'palette',
                'order' => 5,
                'is_active' => true,
                'budgets' => [
                    [
                        'tier_key' => 'design_audit',
                        'type' => [
                            'en' => 'UI/UX Audit & Wireframes',
                            'ar' => 'تدقيق الواجهات والمخططات الهيكلية',
                        ],
                        'range' => '$600 - $1,500 (18,000 - 45,000 EGP)',
                        'description' => [
                            'en' => 'UX evaluation, journey mapping, and low-fidelity prototypes.',
                            'ar' => 'تحليل رحلة المستخدم، اكتشاف نقاط الضعف ونماذج مبدئية تفاعلية.',
                        ],
                        'order' => 1,
                    ],
                    [
                        'tier_key' => 'full_product_design',
                        'type' => [
                            'en' => 'Complete Product UI/UX Design',
                            'ar' => 'تصميم منتج رقمي كامل (Figma)',
                        ],
                        'range' => '$2,000 - $4,500 (60,000 - 135,000 EGP)',
                        'description' => [
                            'en' => 'Pixel-perfect web/mobile Figma screens with design system and components.',
                            'ar' => 'شاشات كاملة للويب والتطبيقات مع مكتبة مكونات متكاملة قابلة للبرمجة.',
                        ],
                        'order' => 2,
                    ],
                ],
            ],
        ];

        foreach ($services as $srvData) {
            $budgets = $srvData['budgets'] ?? [];
            unset($srvData['budgets']);

            $service = Service::updateOrCreate(
                ['slug' => $srvData['slug']],
                $srvData
            );

            foreach ($budgets as $bData) {
                ServiceBudget::updateOrCreate(
                    [
                        'service_id' => $service->id,
                        'tier_key' => $bData['tier_key'],
                    ],
                    $bData
                );
            }
        }
    }
}
