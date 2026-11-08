<?php

namespace Database\Seeders;

use App\Models\WhatsAppAccount;
use App\Models\WhatsAppQuickReply;
use App\Models\WhatsAppTemplate;
use Illuminate\Database\Seeder;

class WhatsAppSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. WhatsApp Business Account
        WhatsAppAccount::firstOrCreate(
            ['phone_number_id' => config('whatsapp.phone_number_id') ?: '100000000000000'],
            [
                'name' => 'Ofoq Technology Main WhatsApp',
                'business_account_id' => config('whatsapp.business_account_id') ?: '200000000000000',
                'display_phone_number' => config('whatsapp.display_phone_number') ?: '+20 100 000 0000',
                'access_token' => config('whatsapp.access_token'),
                'app_secret' => config('whatsapp.app_secret'),
                'webhook_verify_token' => config('whatsapp.webhook_verify_token') ?: 'ofoq_whatsapp_verify_token_2026',
                'graph_version' => config('whatsapp.graph_version', 'v22.0'),
                'is_active' => true,
                'is_default' => true,
            ]
        );

        // 2. Default Message Templates
        $templates = [
            [
                'name' => 'lead_follow_up_ar',
                'language' => 'ar',
                'category' => 'UTILITY',
                'status' => 'APPROVED',
                'header_type' => 'NONE',
                'body_text' => 'مرحباً {{1}}، نتواصل معك من شركة أفق للبرمجيات لمتابعة طلبك بخصوص مشروعك. هل يناسبك تحديد موعد لمناقشة التفاصيل؟',
                'footer_text' => 'فريق أفق للحلول الرقمية',
                'example_parameters' => ['أحمد'],
            ],
            [
                'name' => 'lead_follow_up_en',
                'language' => 'en',
                'category' => 'UTILITY',
                'status' => 'APPROVED',
                'header_type' => 'NONE',
                'body_text' => 'Hello {{1}}, this is Ofoq Technology following up regarding your project inquiry. When would be a convenient time for a quick discovery call?',
                'footer_text' => 'Ofoq Technology Team',
                'example_parameters' => ['John'],
            ],
            [
                'name' => 'service_quote_ready_ar',
                'language' => 'ar',
                'category' => 'UTILITY',
                'status' => 'APPROVED',
                'header_type' => 'NONE',
                'body_text' => 'أهلاً بك {{1}}، تم تجهيز مقترح العمل والعرض المالي لمشروعك ({{2}}). يسعدنا مراجعته معك والإجابة على أي استفسارات.',
                'footer_text' => 'أفق للبرمجيات',
                'example_parameters' => ['محمد', 'تطبيق ويب متكامل'],
            ],
            [
                'name' => 'meeting_confirmation_ar',
                'language' => 'ar',
                'category' => 'UTILITY',
                'status' => 'APPROVED',
                'header_type' => 'NONE',
                'body_text' => 'مرحباً {{1}}، تم تأكيد موعد اجتماعنا القادم يوم {{2}} لمناقشة تفاصيل وخطة العمل لمشروعك.',
                'footer_text' => 'أفق للبرمجيات',
                'example_parameters' => ['سارة', 'الأربعاء 4 مساءً'],
            ],
        ];

        foreach ($templates as $tpl) {
            WhatsAppTemplate::updateOrCreate(
                ['name' => $tpl['name'], 'language' => $tpl['language']],
                $tpl
            );
        }

        // 3. Quick Replies (Agent Canned Responses)
        $quickReplies = [
            [
                'shortcut' => '/intro',
                'title' => 'الترحيب والتعريف بالشركة',
                'category' => 'welcome',
                'content' => "أهلاً بك في شركة أفق للبرمجيات والحلول الرقمية! 🚀\nنحن شركة متخصصة في تطوير تطبيقات الويب، تطبيقات الهواتف الذكية، الأنظمة السحابية والهويات الرقمية. يسعدنا مساعدتك في تحقيق أهداف مشروعك بأعلى معايير الجودة.",
            ],
            [
                'shortcut' => '/services',
                'title' => 'قائمة الخدمات البرمجية',
                'category' => 'services',
                'content' => "نقدم في أفق مجموعة متكاملة من الخدمات الرقمية:\n1. تطوير تطبيقات الويب والمنصات السحابية (Web Apps & SaaS)\n2. تطبيقات الهواتف الذكية (iOS & Android)\n3. تطوير مواقع التجارة الإلكترونية وأنظمة المدفوعات\n4. تصميم تجربة وواجهة المستخدم (UI/UX)\n5. استشارات التحول الرقمي والتكامل مع الأنظمة الخارجية",
            ],
            [
                'shortcut' => '/meeting',
                'title' => 'طلب حجز موعد اجتماع استشاري',
                'category' => 'meetings',
                'content' => 'يسعدنا ترتيب جلسة استشارية أولية مجانية عبر Google Meet لمناقشة نطاق مشروعك وخارطة الطريق. ما هي المواعيد الأنسب لك خلال هذا الأسبوع؟',
            ],
            [
                'shortcut' => '/pricing',
                'title' => 'استفسار عن التكلفة والعروض',
                'category' => 'sales',
                'content' => 'تعتمد التكلفة التقديرية على نطاق الميزات الفنية، الجدول الزمني، والتقنيات المختارة. نقوم بإعداد عرض سعر تفصيلي مجاناً يتضمن مراحل التنفيذ ومخطط التسليم بعد فهم متطلباتك بالتفصيل.',
            ],
            [
                'shortcut' => '/location',
                'title' => 'موقع الشركة ومعلومات التواصل',
                'category' => 'info',
                'content' => "شركة أفق للبرمجيات والحلول الرقمية 📍\nالبريد الإلكتروني: contact@ofoqtech.com\nالموقع الإلكتروني: https://ofoqtech.com\nساعات العمل: من الأحد إلى الخميس (9:00 ص - 6:00 م)",
            ],
        ];

        foreach ($quickReplies as $qr) {
            WhatsAppQuickReply::updateOrCreate(
                ['shortcut' => $qr['shortcut']],
                $qr
            );
        }
    }
}
