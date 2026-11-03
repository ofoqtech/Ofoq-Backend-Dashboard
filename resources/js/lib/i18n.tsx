import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useMemo,
} from 'react';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

interface I18nContextType {
    locale: Locale;
    dir: Direction;
    isRtl: boolean;
    setLocale: (loc: Locale) => void;
    toggleLocale: () => void;
    t: (key: string, fallback?: string) => string;
    localized: (
        value:
            | { en?: string | null; ar?: string | null }
            | string
            | null
            | undefined,
    ) => string;
    formatDate: (
        date: string | Date,
        options?: Intl.DateTimeFormatOptions,
    ) => string;
}

const STORAGE_KEY = 'ofoq_locale';

const translations: Record<Locale, Record<string, string>> = {
    en: {
        // Navigation & Shell
        'nav.dashboard': 'Dashboard',
        'nav.crm': 'CRM & Leads',
        'nav.notifications': 'Notifications',
        'nav.admins': 'Administrators',
        'nav.employees': 'Employees',
        'nav.categories': 'Categories',
        'nav.projects': 'Projects',
        'nav.platform': 'Platform',
        'nav.profile': 'Profile Settings',
        'nav.security': 'Security',
        'nav.appearance': 'Appearance',
        'nav.logout': 'Log out',
        'nav.website': 'Ofoq Website',
        'nav.language': 'Language',
        'nav.switch_to_ar': 'العربية',
        'nav.switch_to_en': 'English',

        // Common
        'common.search': 'Search',
        'common.filter': 'Filter',
        'common.reset': 'Reset',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.create': 'Create',
        'common.actions': 'Actions',
        'common.details': 'Details',
        'common.status': 'Status',
        'common.priority': 'Priority',
        'common.role': 'Role',
        'common.all': 'All',
        'common.active': 'Active',
        'common.inactive': 'Inactive',
        'common.name': 'Name',
        'common.phone': 'Phone',
        'common.email': 'Email',
        'common.company': 'Company',
        'common.date': 'Date',
        'common.view_all': 'View all',
        'common.unassigned': 'Unassigned',
        'common.confirm': 'Confirm',
        'common.close': 'Close',
        'common.clear': 'Clear',
        'common.saving': 'Saving...',
        'common.loading': 'Loading...',
        'common.deleting': 'Deleting...',
        'common.creating': 'Creating...',
        'common.auto_saved': 'Auto-saved on change',
        'common.you': 'You',
        'common.showing': 'Showing',
        'common.to': 'to',
        'common.of': 'of',
        'common.results': 'results',
        'common.general': 'General Request',
        'common.custom_inquiry': 'Custom Inquiry',
        'common.website_system': 'Website System',
        'common.not_specified': 'Not specified',

        // Dashboard
        'dashboard.welcome': 'Welcome back',
        'dashboard.subtitle':
            'Manage Ofoq Tech projects, team members, and client delivery operations.',
        'dashboard.crm_inquiries': 'CRM Inquiries',
        'dashboard.new_tag': 'new',
        'dashboard.total_projects': 'Total Projects',
        'dashboard.portfolio_items': 'Portfolio showcase items',
        'dashboard.team_members': 'Team Members',
        'dashboard.admins_count': 'admins with full system access',
        'dashboard.web_mobile': 'Web & Mobile Apps',
        'dashboard.web': 'Web',
        'dashboard.mobile': 'Mobile',
        'dashboard.erp_cloud': 'ERP & Cloud Systems',
        'dashboard.enterprise_systems': 'Enterprise systems',
        'dashboard.recent_inquiries': 'Recent Client Inquiries',
        'dashboard.recent_inquiries_desc':
            'Incoming requests submitted through the "Get In Touch" website form',
        'dashboard.awaiting_response': 'awaiting response',
        'dashboard.open_crm': 'Open CRM',
        'dashboard.recent_projects': 'Recent Projects',
        'dashboard.recent_projects_desc':
            'Latest portfolio entries added to the platform',
        'dashboard.team_staff': 'Team & Staff',
        'dashboard.team_staff_desc': 'Active employees and administrators',
        'dashboard.manage': 'Manage',
        'dashboard.add_admin': 'Add Admin',
        'dashboard.add_employee': 'Add Employee',
        'dashboard.add_project': 'Add Project',
        'dashboard.crm_pipeline': 'CRM Pipeline',
        'dashboard.whatsapp': 'WhatsApp',
        'dashboard.no_projects': 'No projects found yet.',
        'dashboard.no_team': 'No team members registered yet.',

        // CRM Page
        'crm.title': 'CRM & Client Inquiries',
        'crm.subtitle':
            'Manage incoming project requests from the website contact form and track deals through the pipeline.',
        'crm.tab_all': 'All Inquiries',
        'crm.tab_kanban': 'Pipeline Board',
        'crm.tab_new': 'New Inquiries',
        'crm.tab_in_progress': 'In Progress',
        'crm.tab_won': 'Won Deals',
        'crm.tab_lost': 'Lost Deals',
        'crm.per_page': 'Per page',
        'crm.all_in_progress': 'All Active Stages',
        'crm.no_leads_in_tab': 'No inquiries found in this section.',
        'crm.no_new_leads': 'All caught up! No uncontacted inquiries awaiting first response.',
        'crm.no_in_progress': 'No deals currently in discussion or negotiation.',
        'crm.no_won_deals': 'No won deals recorded yet.',
        'crm.no_lost_deals': 'No lost deals in records.',
        'crm.kanban': 'Kanban',
        'crm.table': 'Table',
        'crm.record_inquiry': 'Record Inquiry',
        'crm.total_inquiries': 'Total Inquiries',
        'crm.all_time_requests': 'All-time client requests',
        'crm.new_uncontacted': 'New / Uncontacted',
        'crm.awaiting_first_response': 'Awaiting first response',
        'crm.in_progress': 'In Progress',
        'crm.under_discussion': 'Under discussion / proposal',
        'crm.won_deals': 'Won Deals',
        'crm.successfully_converted': 'Successfully converted',
        'crm.conversion_rate': 'Conversion Rate',
        'crm.won_of_total': 'won out of',
        'crm.search_placeholder':
            'Search by client, phone, company, or service...',
        'crm.all_stages': 'All Stages',
        'crm.all_priorities': 'All Priorities',
        'crm.all_reps': 'All Reps',
        'crm.stage': 'Stage',
        'crm.priority': 'Priority',
        'crm.assignee': 'Assignee',
        'crm.no_leads_stage': 'No leads in this stage',
        'crm.no_leads_found': 'No leads found',
        'crm.no_leads_hint': 'Try adjusting your filters or search keywords.',
        'crm.client_company': 'Client & Company',
        'crm.contact': 'Contact',
        'crm.service_budget': 'Service & Budget',
        'crm.submitted': 'Submitted',
        'crm.chat_whatsapp': 'Chat on WhatsApp',
        'crm.call': 'Call',
        'crm.email': 'Email',
        'crm.pipeline_stage': 'Pipeline Stage',
        'crm.priority_level': 'Priority Level',
        'crm.assigned_rep': 'Assigned Representative',
        'crm.lead_stage_mgmt': 'Lead Stage & Assignment',
        'crm.project_scope_details': 'Project & Scope Details',
        'crm.service_requested': 'Service Requested',
        'crm.budget_range': 'Budget Tier Range',
        'crm.first_submitted': 'First Submitted',
        'crm.inquiry_source': 'Inquiry Source',
        'crm.marketing_attribution': 'Marketing & Lead Attribution',
        'crm.channel': 'Traffic Source / Channel',
        'crm.campaign': 'Campaign Name',
        'crm.medium': 'Medium / Placement',
        'crm.ad_content': 'Ad Content / Variation',
        'crm.form_signed': 'Form Submitted',
        'crm.landing_page': 'Landing Page',
        'crm.referrer': 'HTTP Referrer',
        'crm.channels_breakdown': 'Acquisition Channels Breakdown',
        'crm.filter_by_channel': 'Filter by Channel',
        'crm.all_channels': 'All Channels',
        'crm.meta': 'Meta (Facebook, Instagram, Messenger)',
        'crm.facebook': 'Facebook Ads',
        'crm.instagram': 'Instagram Ads',
        'crm.tiktok': 'TikTok',
        'crm.snapchat': 'Snapchat',
        'crm.linkedin': 'LinkedIn',
        'crm.google': 'Google Ads',
        'crm.other_channels': 'Direct & Other Sources',
        'notifications.title': 'Real-time Alerts & Sound',
        'notifications.push_status': 'Mobile & Browser Push',
        'notifications.sound_status': 'Chime Sound Alert',
        'notifications.enabled': 'Active',
        'notifications.disabled': 'Muted / Inactive',
        'notifications.enable_push': 'Enable Browser & Mobile Alerts',
        'notifications.permission_granted': 'Notifications Active',
        'notifications.permission_denied': 'Notifications Blocked in Browser',
        'notifications.test_btn': 'Test Sound & Instant Alert',
        'notifications.mute_sound': 'Mute Chime Sound',
        'notifications.unmute_sound': 'Enable Chime Sound',
        'notifications.page_title': 'Notification History',
        'notifications.page_subtitle': 'Chronological log of all incoming client inquiries and ad campaign alerts (Newest to Oldest).',
        'notifications.total_alerts': 'Total Alerts',
        'notifications.today_alerts': "Today's Alerts",
        'notifications.new_uncontacted': 'Awaiting Contact',
        'notifications.filter_search': 'Search by client, phone, company, campaign...',
        'notifications.all_channels': 'All Channels',
        'notifications.all_statuses': 'All Stages',
        'notifications.open_in_crm': 'View in CRM',
        'notifications.no_alerts_found': 'No notification records match the selected filters.',
        'crm.initial_message': 'Initial Message / Note:',
        'crm.reason_lost': 'Reason Lost:',
        'crm.ready_initiate': 'Ready to initiate production?',
        'crm.convert_to_project': 'Convert to Project',
        'crm.log_communication': 'Log Communication or Activity',
        'crm.note_placeholder':
            'Enter details of your call, conversation, or internal instructions...',
        'crm.add_to_timeline': 'Add to Timeline',
        'crm.activity_timeline': 'Activity Timeline',
        'crm.no_activities': 'No activities recorded yet.',
        'crm.delete_lead': 'Delete Lead',
        'crm.delete_lead_desc':
            'Permanently remove this inquiry and all associated activities.',
        'crm.record_dialog_title': 'Record New Client Inquiry',
        'crm.record_dialog_desc':
            'Manually record an incoming inquiry from a direct call, client meeting, or offline event.',
        'crm.client_name': 'Client Full Name',
        'crm.mobile_phone': 'Mobile / Phone',
        'crm.email_address': 'Email Address',
        'crm.company_business': 'Company / Business',
        'crm.budget_option': 'Budget Option',
        'crm.select_service': 'Select Service',
        'crm.select_budget': 'Select Budget',
        'crm.select_service_first': 'Choose Service First',
        'crm.source': 'Source',
        'crm.source_call': 'Phone Call',
        'crm.source_whatsapp': 'Direct WhatsApp',
        'crm.source_walk_in': 'Office Walk-in',
        'crm.source_referral': 'Referral / Network',
        'crm.source_event': 'Tech Event / Exhibition',
        'crm.source_get_in_touch': 'Website Get In Touch Form',
        'crm.initial_notes': 'Initial Requirements & Notes',
        'crm.delete_confirm_title': 'Confirm Delete Lead',
        'crm.delete_confirm_msg':
            'Are you sure you want to delete this lead? This action cannot be undone.',
        'crm.assigned_by_admin': 'Assigned by Admin',

        // Pipeline Stages
        'stage.new': 'New Inquiry',
        'stage.contacted': 'Contacted',
        'stage.qualified': 'Qualified',
        'stage.proposal_sent': 'Proposal Sent',
        'stage.negotiation': 'Negotiation',
        'stage.won': 'Won',
        'stage.lost': 'Lost',

        // Priorities
        'priority.low': 'Low',
        'priority.medium': 'Medium',
        'priority.high': 'High',
        'priority.urgent': 'Urgent',

        // Activity types
        'activity.note': 'Internal Note',
        'activity.call': 'Phone Call',
        'activity.whatsapp': 'WhatsApp Chat',
        'activity.meeting': 'Client Meeting',
        'activity.proposal_sent': 'Proposal Sent',
        'activity.created': 'Inquiry Created',
        'activity.status_change': 'Status Changed',
        'activity.assigned': 'Assignee Changed',

        // Projects Page
        'projects.title': 'Portfolio Projects',
        'projects.subtitle':
            'Manage projects, showcase items, technologies, and metrics displayed on the frontend website.',
        'projects.filter_title': 'Filter Projects',
        'projects.filter_desc': 'Search by title, technology, or category',
        'projects.search_placeholder':
            'Search title, technologies, or keywords...',
        'projects.all_categories': 'All Categories',
        'projects.add_project': 'Add Project',
        'projects.no_projects_found': 'No projects found',
        'projects.no_projects_hint':
            'Try adjusting your filters or click Add Project to create one.',
        'projects.featured': 'Featured',
        'projects.view_live': 'Live Demo',
        'projects.delete_title': 'Delete Project',
        'projects.delete_msg':
            'Are you sure you want to delete this project? This will remove the project from the dashboard and the frontend portfolio.',

        // Categories Page
        'categories.title': 'Project Categories',
        'categories.subtitle':
            'Manage project classifications and portfolio taxonomy.',
        'categories.bilingual_taxonomy': 'Taxonomy',
        'categories.add_category': 'Add Category',
        'categories.filter_title': 'Filter Categories',
        'categories.filter_desc': 'Search by category name or system slug',
        'categories.search_placeholder':
            'Search categories (e.g. Web, Mobile, ERP)...',
        'categories.order': 'Order',
        'categories.slug': 'Slug',
        'categories.linked_projects': 'Linked Projects',
        'categories.no_categories_found':
            'No categories found matching your query.',

        // Employees & Admins
        'employees.title': 'Employee Staff',
        'employees.subtitle':
            'Manage employees, job titles, and contact information.',
        'employees.staff_roster': 'Staff Roster',
        'employees.add_employee': 'Add Employee',
        'employees.filter_title': 'Filter Employees',
        'employees.filter_desc': 'Search by name, email, or job title',
        'employees.search_placeholder':
            'Search by employee name, email, or job title...',
        'employees.job_title': 'Job Title',
        'employees.no_employees_found':
            'No employees found matching your criteria.',

        'admins.title': 'System Administrators',
        'admins.subtitle':
            'Manage platform administrators and operational system access.',
        'admins.security_access': 'Security Access',
        'admins.add_admin': 'Add Admin',
        'admins.filter_title': 'Filter Administrators',
        'admins.filter_desc': 'Search by name, email, or administrative title',
        'admins.search_placeholder':
            'Search by administrator name, email, or title...',
        'admins.admin_col': 'Administrator',
        'admins.title_col': 'Administrative Title',
        'admins.no_admins_found':
            'No administrators found matching the criteria.',

        // Forms & Common Actions
        'common.back_to_projects': 'Back to Projects',
        'common.back_to_employees': 'Back to Employees',
        'common.back_to_admins': 'Back to Administrators',
        'common.back_to_categories': 'Back to Categories',
        'common.save_changes': 'Save Changes',

        // Projects Forms
        'projects.add_title': 'Add New Project',
        'projects.add_desc':
            'Create a portfolio project with full bilingual attributes, technologies, and metrics.',
        'projects.edit_title': 'Edit Project',
        'projects.edit_desc':
            'Update portfolio showcase details, gallery, technologies, and client metrics.',
        'projects.form_info_title': 'Project Details & Bilingual Copy',
        'projects.form_info_desc':
            'Primary titles, category classification, slug, and client links.',
        'projects.form_arabic_title': 'Arabic Title *',
        'projects.form_english_title': 'English Title *',
        'projects.form_category': 'Category *',
        'projects.form_category_label_en': 'Category Label (EN) *',
        'projects.form_category_label_ar': 'Category Label (AR)',
        'projects.form_slug': 'Slug / URL Key',
        'projects.form_slug_hint': '(auto-generated if empty)',
        'projects.form_client': 'Client Name',
        'projects.form_live_url': 'Live Website / Store Link',
        'projects.form_is_featured':
            'Featured Project (highlighted on website homepage)',
        'projects.form_order': 'Display Sort Order',
        'projects.form_descriptions_title': 'Taglines & Detailed Descriptions',
        'projects.form_descriptions_desc':
            'Provide localized project summaries, problem statements, and solutions.',
        'projects.form_tagline_en': 'Short Tagline (EN)',
        'projects.form_tagline_ar': 'Short Tagline (AR)',
        'projects.form_desc_en': 'Full Description (EN)',
        'projects.form_desc_ar': 'Full Description (AR)',
        'projects.form_problem_en': 'Challenge / Problem (EN)',
        'projects.form_problem_ar': 'Challenge / Problem (AR)',
        'projects.form_solution_en': 'Solution Delivered (EN)',
        'projects.form_solution_ar': 'Solution Delivered (AR)',
        'projects.form_cover_title': 'Primary Cover Image',
        'projects.form_cover_desc':
            'Showcase thumbnail displayed on homepage and project cards (16:9 ratio recommended).',
        'projects.form_upload_cover': 'Upload Cover Image',
        'projects.form_drop_cover':
            'or drag and drop file here (PNG, JPG, WebP up to 4MB)',
        'projects.form_choose_file': 'Choose File',
        'projects.form_tech_title': 'Technologies Stack',
        'projects.form_tech_desc':
            'Add framework, library, and tool badges (e.g. React, Flutter, Laravel, Docker).',
        'projects.form_tech_placeholder':
            'Type a technology and press Add or Enter...',
        'projects.form_add_tech': 'Add',
        'projects.form_metrics_title': 'Key Metrics & Business Impact',
        'projects.form_metrics_desc':
            'Add quantitative results achieved for the client (e.g. 99.9% Uptime, +300% Growth).',
        'projects.form_metric_val': 'Metric Value (e.g. 50K+, 99.9%)',
        'projects.form_metric_label':
            'Metric Label (e.g. Active Users, Uptime)',
        'projects.form_add_metric': 'Add Metric',
        'projects.form_gallery_title': 'Project Showcase Gallery',
        'projects.form_gallery_desc':
            'Upload high-resolution screenshots, mobile UI frames, and client deliverables.',
        'projects.form_upload_gallery': 'Upload Gallery Images',
        'projects.form_save_btn': 'Save Project',

        // Employees Forms
        'employees.add_title': 'Add New Employee',
        'employees.add_desc':
            'Create an account for an employee to access the dashboard.',
        'employees.edit_title': 'Edit Employee',
        'employees.edit_desc':
            'Update employee credentials, titles, and account status.',
        'employees.info_title': 'Employee Information',
        'employees.info_desc': 'Fill in the credentials and profile details.',
        'employees.full_name': 'Full Name *',
        'employees.email_address': 'Email Address *',
        'employees.password': 'Initial Password * (minimum 8 characters)',
        'employees.new_password': 'New Password (leave blank to keep current)',
        'employees.system_role': 'System Role',
        'employees.role_employee': 'Employee (Staff Member)',
        'employees.account_status': 'Account Status *',
        'employees.title_en': 'Job Title (EN)',
        'employees.title_ar': 'Job Title (AR)',
        'employees.phone_number': 'Phone Number',
        'employees.save_btn': 'Save Employee',

        // Admins Forms
        'admins.add_title': 'Add New Administrator',
        'admins.add_desc':
            'Create an administrator account with full control over the dashboard, employees, and projects.',
        'admins.edit_title': 'Edit Administrator',
        'admins.edit_desc':
            'Update administrative credentials, titles, and system security status.',
        'admins.info_title': 'Administrator Credentials & Profile',
        'admins.info_desc':
            'Enter authentication credentials and administrative profile information.',
        'admins.system_authority': 'System Authority',
        'admins.authority_full': 'Administrator (Full System Control)',
        'admins.title_en': 'Administrative Title (EN)',
        'admins.title_ar': 'Administrative Title (AR)',
        'admins.save_btn': 'Save Administrator',

        // Categories Forms
        'categories.add_title': 'Add New Category',
        'categories.add_desc':
            'Create a project category with bilingual Arabic and English taxonomy stored in JSON format.',
        'categories.edit_title': 'Edit Category',
        'categories.edit_desc':
            'Update bilingual Arabic and English taxonomy and display order.',
        'categories.info_title': 'Category Information',
        'categories.info_desc':
            'Define names in English and Arabic for projects to categorize under.',
        'categories.name_en': 'Category Name (English) *',
        'categories.name_ar': 'Category Name (Arabic) *',
        'categories.slug_label': 'URL Slug',
        'categories.slug_hint': '(optional, auto-generated from English name)',
        'categories.order_label': 'Display Sort Order',
        'categories.desc_en': 'Description (English)',
        'categories.desc_ar': 'Description (Arabic)',
        'categories.is_active_label':
            'Active category (available for assignment in projects)',
        'categories.save_btn': 'Save Category',

        // Profile & Account Settings
        'profile.settings': 'Profile Settings',
        'profile.title': 'Profile Information',
        'profile.desc': 'Update your photo, personal details, and contact information.',
        'profile.photo': 'Profile Photo',
        'profile.photo_hint': 'PNG, JPG, WEBP, or GIF up to 5MB. A square image is recommended.',
        'profile.upload_photo': 'Upload Photo',
        'profile.change_photo': 'Change Photo',
        'profile.remove_photo': 'Remove Photo',
        'profile.name': 'Full Name',
        'profile.email': 'Email Address',
        'profile.phone': 'Phone Number',
        'profile.job_title': 'Job Title',
        'profile.job_title_ar': 'Job Title (Arabic)',
        'profile.role': 'Account Role',
        'profile.status': 'Account Status',
        'profile.unverified_email': 'Your email address is unverified.',
        'profile.resend_verification': 'Click here to re-send the verification email.',
        'profile.verification_sent': 'A new verification link has been sent to your email address.',
        'profile.saved': 'Profile updated successfully.',
    },
    ar: {
        // Navigation & Shell
        'nav.dashboard': 'لوحة التحكم',
        'nav.crm': 'إدارة العملاء والطلبات',
        'nav.notifications': 'سجل الإشعارات',
        'nav.admins': 'المسؤولون',
        'nav.employees': 'فريق العمل',
        'nav.categories': 'التصنيفات',
        'nav.projects': 'المشاريع',
        'nav.platform': 'المنصة',
        'nav.profile': 'الملف الشخصي',
        'nav.security': 'الأمان',
        'nav.appearance': 'المظهر',
        'nav.logout': 'تسجيل الخروج',
        'nav.website': 'موقع أفق',
        'nav.language': 'اللغة',
        'nav.switch_to_ar': 'العربية',
        'nav.switch_to_en': 'English',

        // Common
        'common.search': 'بحث',
        'common.filter': 'تصفية',
        'common.reset': 'إعادة تعيين',
        'common.save': 'حفظ',
        'common.cancel': 'إلغاء',
        'common.delete': 'حذف',
        'common.edit': 'تعديل',
        'common.create': 'إنشاء',
        'common.actions': 'الإجراءات',
        'common.details': 'التفاصيل',
        'common.status': 'الحالة',
        'common.priority': 'الأولوية',
        'common.role': 'الدور',
        'common.all': 'الكل',
        'common.active': 'نشط',
        'common.inactive': 'معطل',
        'common.name': 'الاسم',
        'common.phone': 'رقم الهاتف',
        'common.email': 'البريد الإلكتروني',
        'common.company': 'الشركة / المؤسسة',
        'common.date': 'التاريخ',
        'common.view_all': 'عرض الكل',
        'common.unassigned': 'غير مخصص',
        'common.confirm': 'تأكيد',
        'common.close': 'إغلاق',
        'common.clear': 'مسح',
        'common.saving': 'جاري الحفظ...',
        'common.loading': 'جاري التحميل...',
        'common.deleting': 'جاري الحذف...',
        'common.creating': 'جاري الإنشاء...',
        'common.auto_saved': 'يتم الحفظ تلقائياً عند التغيير',
        'common.you': 'أنت',
        'common.showing': 'عرض',
        'common.to': 'إلى',
        'common.of': 'من إجمالي',
        'common.results': 'نتائج',
        'common.general': 'طلب عام',
        'common.custom_inquiry': 'طلب استشارة مخصصة',
        'common.website_system': 'نظام الموقع',
        'common.not_specified': 'غير محدد',

        // Dashboard
        'dashboard.welcome': 'مرحباً بعودتك',
        'dashboard.subtitle':
            'إدارة مشاريع أفق للتكنولوجيا وفريق العمل والعمليات التشغيلية.',
        'dashboard.crm_inquiries': 'طلبات العملاء (CRM)',
        'dashboard.new_tag': 'جديد',
        'dashboard.total_projects': 'إجمالي المشاريع',
        'dashboard.portfolio_items': 'أعمال معروضة في سابقة الأعمال',
        'dashboard.team_members': 'أعضاء الفريق',
        'dashboard.admins_count': 'مسؤولون بصلاحيات نظام كاملة',
        'dashboard.web_mobile': 'تطبيقات الويب والموبايل',
        'dashboard.web': 'ويب',
        'dashboard.mobile': 'موبايل',
        'dashboard.erp_cloud': 'أنظمة المؤسسات والسحاب',
        'dashboard.enterprise_systems': 'أنظمة سحابية مؤسسية',
        'dashboard.recent_inquiries': 'أحدث طلبات واستفسارات العملاء',
        'dashboard.recent_inquiries_desc':
            'الطلبات الواردة عبر نموذج "تواصل معنا" من الموقع الإلكتروني',
        'dashboard.awaiting_response': 'في انتظار الرد',
        'dashboard.open_crm': 'فتح نظام العملاء',
        'dashboard.recent_projects': 'أحدث المشاريع',
        'dashboard.recent_projects_desc':
            'آخر المشاريع المضافة إلى سابقة الأعمال',
        'dashboard.team_staff': 'فريق العمل والمسؤولين',
        'dashboard.team_staff_desc': 'الموظفون والمديرون النشطون في النظام',
        'dashboard.manage': 'إدارة',
        'dashboard.add_admin': 'إضافة مسؤول',
        'dashboard.add_employee': 'إضافة موظف',
        'dashboard.add_project': 'إضافة مشروع',
        'dashboard.crm_pipeline': 'مراحل الصفقات',
        'dashboard.whatsapp': 'واتساب',
        'dashboard.no_projects': 'لا توجد مشاريع مضافة حتى الآن.',
        'dashboard.no_team': 'لا يوجد أعضاء مسجلون حتى الآن.',

        // CRM Page
        'crm.title': 'إدارة العملاء وطلبات المشاريع',
        'crm.subtitle':
            'متابعة الطلبات الواردة من الموقع الإلكتروني وإدارة مراحل الاتفاق مع العملاء.',
        'crm.tab_all': 'جميع الطلبات',
        'crm.tab_kanban': 'لوحة المراحل والصفقات',
        'crm.tab_new': 'طلبات جديدة',
        'crm.tab_in_progress': 'قيد المتابعة والتفاوض',
        'crm.tab_won': 'صفقات ناجحة',
        'crm.tab_lost': 'صفقات غير مكتملة',
        'crm.per_page': 'لكل صفحة',
        'crm.all_in_progress': 'كافة المراحل الجارية',
        'crm.no_leads_in_tab': 'لم يتم العثور على أي طلبات في هذا القسم.',
        'crm.no_new_leads': 'تم التواصل مع كافة الطلبات! لا توجد طلبات جديدة في انتظار الرد.',
        'crm.no_in_progress': 'لا توجد صفقات قيد النقاش أو التفاوض حالياً.',
        'crm.no_won_deals': 'لا توجد صفقات رابحة مسجلة حتى الآن.',
        'crm.no_lost_deals': 'سجل نظيف! لا توجد صفقات غير مكتملة.',
        'crm.kanban': 'مخطط كانبان',
        'crm.table': 'جدول البيانات',
        'crm.record_inquiry': 'تسجيل طلب جديد',
        'crm.total_inquiries': 'إجمالي الطلبات',
        'crm.all_time_requests': 'كافة استفسارات العملاء المسجلة',
        'crm.new_uncontacted': 'جديد / لم يتم التواصل',
        'crm.awaiting_first_response': 'في انتظار أول تواصل',
        'crm.in_progress': 'قيد المتابعة والاتفاق',
        'crm.under_discussion': 'جلسات نقاش وتقديم عروض أسعار',
        'crm.won_deals': 'صفقات ناجحة',
        'crm.successfully_converted': 'تم الاتفاق والتحويل لمشروع',
        'crm.conversion_rate': 'معدل التحويل',
        'crm.won_of_total': 'صفقة ناجحة من إجمالي',
        'crm.search_placeholder':
            'بحث باسم العميل، الهاتف، الشركة، أو الخدمة...',
        'crm.all_stages': 'جميع المراحل',
        'crm.all_priorities': 'جميع الأولويات',
        'crm.all_reps': 'جميع الموظفين',
        'crm.stage': 'المرحلة',
        'crm.priority': 'الأولوية',
        'crm.assignee': 'المسؤول',
        'crm.no_leads_stage': 'لا توجد طلبات في هذه المرحلة',
        'crm.no_leads_found': 'لم يتم العثور على طلبات',
        'crm.no_leads_hint': 'جرب تغيير معايير التصفية أو كلمات البحث.',
        'crm.client_company': 'العميل والشركة',
        'crm.contact': 'بيانات الاتصال',
        'crm.service_budget': 'الخدمة والميزانية',
        'crm.submitted': 'تاريخ الإرسال',
        'crm.chat_whatsapp': 'محادثة واتساب',
        'crm.call': 'اتصال هاتف',
        'crm.email': 'إرسال بريد',
        'crm.pipeline_stage': 'مرحلة الطلب',
        'crm.priority_level': 'مستوى الأولوية',
        'crm.assigned_rep': 'الموظف المسؤول',
        'crm.lead_stage_mgmt': 'مرحلة الطلب والتكليف',
        'crm.project_scope_details': 'تفاصيل المشروع ونطاق العمل',
        'crm.service_requested': 'الخدمة المطلوبة',
        'crm.budget_range': 'النطاق المالي المتوقع',
        'crm.first_submitted': 'تاريخ التسجيل الأول',
        'crm.inquiry_source': 'مصدر الطلب',
        'crm.marketing_attribution': 'بيانات التسويق والحملات الإعلانية',
        'crm.channel': 'مصدر الزيارة / القناة الإعلانية',
        'crm.campaign': 'اسم الحملة الإعلانية (Campaign)',
        'crm.medium': 'طريقة الاستهداف / الموضع (Medium)',
        'crm.ad_content': 'محتوى الإعلان (Content)',
        'crm.form_signed': 'النموذج المُرسل (Form)',
        'crm.landing_page': 'صفحة الهبوط (Landing Page)',
        'crm.referrer': 'رابط الإحالة (Referrer)',
        'crm.channels_breakdown': 'توزيع مصادر العملاء والطلبات',
        'crm.filter_by_channel': 'تصفية حسب القناة',
        'crm.all_channels': 'جميع القنوات',
        'crm.meta': 'ميتا (فيسبوك، انستغرام، ماسنجر)',
        'crm.facebook': 'إعلانات فيسبوك',
        'crm.instagram': 'إعلانات انستغرام',
        'crm.tiktok': 'تيك توك',
        'crm.snapchat': 'سناب شات',
        'crm.linkedin': 'لينكد إن',
        'crm.google': 'إعلانات جوجل',
        'crm.other_channels': 'مباشر ومصادر أخرى',
        'notifications.title': 'التنبيهات اللحظية والصوت',
        'notifications.push_status': 'إشعارات المتصفح والموبايل',
        'notifications.sound_status': 'نغمة التنبيه الصوتي',
        'notifications.enabled': 'مفعل',
        'notifications.disabled': 'صامت / معطل',
        'notifications.enable_push': 'تفعيل إشعارات المتصفح والموبايل',
        'notifications.permission_granted': 'الإشعارات مفعلة بنجاح',
        'notifications.permission_denied': 'الإشعارات محظورة في المتصفح',
        'notifications.test_btn': 'تجربة نغمة الإشعار الآن',
        'notifications.mute_sound': 'كتم نغمة الصوت',
        'notifications.unmute_sound': 'تشغيل نغمة الصوت',
        'notifications.page_title': 'سجل الإشعارات والتنبيهات',
        'notifications.page_subtitle': 'سجل زمني لجميع طلبات واستفسارات العملاء الجديدة وتنبيهات الحملات مرتبة من الأحدث إلى الأقدم.',
        'notifications.total_alerts': 'إجمالي التنبيهات',
        'notifications.today_alerts': 'تنبيهات اليوم',
        'notifications.new_uncontacted': 'في انتظار أول تواصل',
        'notifications.filter_search': 'بحث باسم العميل، الهاتف، الشركة، أو الحملة...',
        'notifications.all_channels': 'جميع القنوات',
        'notifications.all_statuses': 'جميع المراحل',
        'notifications.open_in_crm': 'عرض في الـ CRM',
        'notifications.no_alerts_found': 'لا توجد إشعارات مطابقة لمعايير البحث الحالية.',
        'crm.initial_message': 'الرسالة الأولية / الملاحظات:',
        'crm.reason_lost': 'سبب خسارة الطلب:',
        'crm.ready_initiate': 'جاهز لبدء مرحلة التنفيذ الفعلي؟',
        'crm.convert_to_project': 'تحويل إلى مشروع',
        'crm.log_communication': 'تسجيل تواصل أو نشاط جديد',
        'crm.note_placeholder':
            'اكتب تفاصيل المكالمة، ملخص الاجتماع، أو الملاحظات الداخلية...',
        'crm.add_to_timeline': 'إضافة إلى سجل النشاط',
        'crm.activity_timeline': 'سجل الأنشطة والتواصل',
        'crm.no_activities': 'لا توجد أنشطة مسجلة حتى الآن.',
        'crm.delete_lead': 'حذف الطلب',
        'crm.delete_lead_desc':
            'حذف هذا الطلب وجميع الأنشطة المرتبطة به نهائياً.',
        'crm.record_dialog_title': 'تسجيل طلب عميل جديد',
        'crm.record_dialog_desc':
            'تسجيل يدوي لطلب وارد عبر مكالمة مباشرة، اجتماع، أو تواصل مباشر.',
        'crm.client_name': 'الاسم الكامل للعميل',
        'crm.mobile_phone': 'رقم الموبايل / الهاتف',
        'crm.email_address': 'البريد الإلكتروني',
        'crm.company_business': 'اسم الشركة / النشاط',
        'crm.budget_option': 'فئة الميزانية',
        'crm.select_service': 'اختر الخدمة',
        'crm.select_budget': 'اختر الميزانية',
        'crm.select_service_first': 'اختر الخدمة أولاً',
        'crm.source': 'مصدر الطلب',
        'crm.source_call': 'مكالمة هاتفية',
        'crm.source_whatsapp': 'واتساب مباشر',
        'crm.source_walk_in': 'زيارة للمقر',
        'crm.source_referral': 'توصية / علاقات عمل',
        'crm.source_event': 'معرض أو مؤتمر تقني',
        'crm.source_get_in_touch': 'نموذج تواصل معنا بالموقع',
        'crm.initial_notes': 'المتطلبات الأولية والملاحظات',
        'crm.delete_confirm_title': 'تأكيد حذف الطلب',
        'crm.delete_confirm_msg':
            'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
        'crm.assigned_by_admin': 'تم التكليف بواسطة الإدارة',

        // Pipeline Stages
        'stage.new': 'طلب جديد',
        'stage.contacted': 'تم التواصل',
        'stage.qualified': 'مؤهل تقنياً',
        'stage.proposal_sent': 'تم إرسال العرض',
        'stage.negotiation': 'قيد التفاوض',
        'stage.won': 'تم الاتفاق بنجاح',
        'stage.lost': 'ملغي / مفقود',

        // Priorities
        'priority.low': 'منخفضة',
        'priority.medium': 'متوسطة',
        'priority.high': 'عالية',
        'priority.urgent': 'عاجلة جداً',

        // Activity types
        'activity.note': 'ملاحظة داخلية',
        'activity.call': 'مكالمة هاتفية',
        'activity.whatsapp': 'محادثة واتساب',
        'activity.meeting': 'اجتماع عمل',
        'activity.proposal_sent': 'إرسال عرض فني ومالي',
        'activity.created': 'إنشاء الطلب',
        'activity.status_change': 'تغيير مرحلة الطلب',
        'activity.assigned': 'تغيير الموظف المسؤول',

        // Projects Page
        'projects.title': 'سابقة الأعمال والمشاريع',
        'projects.subtitle':
            'إدارة مشاريع المنصة وسابقة الأعمال والصور والتقنيات المعروضة على الموقع.',
        'projects.filter_title': 'تصفية المشاريع',
        'projects.filter_desc': 'البحث بالعنوان، التقنية، أو التصنيف',
        'projects.search_placeholder':
            'بحث بالعنوان، التقنيات، أو الكلمات المفتاحية...',
        'projects.all_categories': 'كافة التصنيفات',
        'projects.add_project': 'إضافة مشروع',
        'projects.no_projects_found': 'لم يتم العثور على مشاريع',
        'projects.no_projects_hint':
            'جرب تغيير معايير التصفية أو اضغط على إضافة مشروع جديد.',
        'projects.featured': 'مميز',
        'projects.view_live': 'معاينة حية',
        'projects.delete_title': 'تأكيد حذف المشروع',
        'projects.delete_msg':
            'هل أنت متأكد من حذف هذا المشروع؟ سيتم حذفه من لوحة التحكم وسابقة الأعمال في الموقع.',

        // Categories Page
        'categories.title': 'تصنيفات المشاريع',
        'categories.subtitle': 'إدارة تصنيفات المشاريع وتقسيمات سابقة الأعمال.',
        'categories.bilingual_taxonomy': 'التصنيفات',
        'categories.add_category': 'إضافة تصنيف',
        'categories.filter_title': 'تصفية التصنيفات',
        'categories.filter_desc': 'البحث بالاسم العربي أو الإنجليزي أو المعرف',
        'categories.search_placeholder':
            'بحث في التصنيفات بالاسم أو المعرف اللاتيني...',
        'categories.order': 'الترتيب',
        'categories.slug': 'المعرف اللاتيني',
        'categories.linked_projects': 'المشاريع المرتبطة',
        'categories.no_categories_found':
            'لم يتم العثور على أي تصنيفات تطابق البحث.',

        // Employees & Admins
        'employees.title': 'فريق العمل والمهندسين',
        'employees.subtitle':
            'إدارة الموظفين والمهندسين والمسميات الوظيفية ومعلومات الاتصال.',
        'employees.staff_roster': 'سجل العاملين',
        'employees.add_employee': 'إضافة موظف',
        'employees.filter_title': 'تصفية الموظفين',
        'employees.filter_desc':
            'البحث بالاسم أو البريد الإلكتروني أو المسمى الوظيفي',
        'employees.search_placeholder':
            'بحث بالاسم، البريد، أو المسمى الوظيفي...',
        'employees.job_title': 'المسمى الوظيفي',
        'employees.no_employees_found':
            'لم يتم العثور على موظفين يطابقون البحث.',

        'admins.title': 'مديرو النظام',
        'admins.subtitle':
            'إدارة مسؤولي المنصة والصلاحيات الإدارية وأمان النظام.',
        'admins.security_access': 'صلاحيات الأمان',
        'admins.add_admin': 'إضافة مسؤول',
        'admins.filter_title': 'تصفية المسؤولين',
        'admins.filter_desc': 'البحث بالاسم أو البريد أو المسمى الإداري',
        'admins.search_placeholder':
            'بحث باسم المسؤول، البريد، أو المسمى الإداري...',
        'admins.admin_col': 'المسؤول',
        'admins.title_col': 'المسمى الإداري',
        'admins.no_admins_found':
            'لم يتم العثور على أي مديري نظام يطابقون البحث.',

        // Forms & Common Actions
        'common.back_to_projects': 'العودة إلى المشاريع',
        'common.back_to_employees': 'العودة إلى فريق العمل',
        'common.back_to_admins': 'العودة إلى مديري النظام',
        'common.back_to_categories': 'العودة إلى التصنيفات',
        'common.save_changes': 'حفظ التعديلات',

        // Projects Forms
        'projects.add_title': 'إضافة مشروع جديد',
        'projects.add_desc':
            'إنشاء مشروع في سابقة الأعمال ببيانات عربية وإنجليزية كاملة مع التقنيات ومؤشرات الأداء.',
        'projects.edit_title': 'تعديل بيانات المشروع',
        'projects.edit_desc':
            'تحديث تفاصيل سابقة الأعمال ومعرض الصور والتقنيات ومؤشرات إنجاز العميل.',
        'projects.form_info_title': 'بيانات المشروع والنصوص الثنائية اللغة',
        'projects.form_info_desc':
            'العناوين الرئيسية، التصنيف، الرابط التعريفي وروابط موقع العميل.',
        'projects.form_arabic_title': 'العنوان باللغة العربية *',
        'projects.form_english_title': 'العنوان باللغة الإنجليزية *',
        'projects.form_category': 'التصنيف *',
        'projects.form_category_label_en': 'اسم التصنيف (EN) *',
        'projects.form_category_label_ar': 'اسم التصنيف (AR)',
        'projects.form_slug': 'المعرف اللاتيني / الرابط',
        'projects.form_slug_hint': '(يتم التوليد تلقائياً إذا ترك فارغاً)',
        'projects.form_client': 'اسم العميل / الجهة',
        'projects.form_live_url': 'رابط المشروع أو المتجر المباشر',
        'projects.form_is_featured':
            'مشروع مميز (يبرز في الصفحة الرئيسية للموقع)',
        'projects.form_order': 'ترتيب الظهور في المعرض',
        'projects.form_descriptions_title': 'الشعارات الترويجية والتفاصيل',
        'projects.form_descriptions_desc':
            'أضف نبذة تعريفية باللغتين، التحدي الذي واجه العميل والحل البرمجي المنفذ.',
        'projects.form_tagline_en': 'نبذة قصيرة (EN)',
        'projects.form_tagline_ar': 'نبذة قصيرة (AR)',
        'projects.form_desc_en': 'الوصف الكامل (EN)',
        'projects.form_desc_ar': 'الوصف الكامل (AR)',
        'projects.form_problem_en': 'التحدي / المشكلة (EN)',
        'projects.form_problem_ar': 'التحدي / المشكلة (AR)',
        'projects.form_solution_en': 'الحل المنجز (EN)',
        'projects.form_solution_ar': 'الحل المنجز (AR)',
        'projects.form_cover_title': 'الصورة الرئيسية للمشروع (الغلاف)',
        'projects.form_cover_desc':
            'صورة العرض الرئيسية على الموقع وبطاقات المشاريع (نسبة 16:9 موصى بها).',
        'projects.form_upload_cover': 'رفع صورة الغلاف',
        'projects.form_drop_cover':
            'أو اسحب وأفلت الملف هنا (PNG, JPG, WebP بحد أقصى 4MB)',
        'projects.form_choose_file': 'اختر ملفاً',
        'projects.form_tech_title': 'حزمة التقنيات المستخدمة',
        'projects.form_tech_desc':
            'أضف أطر العمل والمكتبات والأدوات (مثال: React, Flutter, Laravel, Docker).',
        'projects.form_tech_placeholder':
            'اكتب اسم التقنية واضغط إضافة أو Enter...',
        'projects.form_add_tech': 'إضافة',
        'projects.form_metrics_title': 'أبرز مؤشرات الأداء والنتائج',
        'projects.form_metrics_desc':
            'أضف أرقاماً كمية حققها المشروع للعميل (مثال: 99.9% جاهزية، +300% مبيعات).',
        'projects.form_metric_val': 'القيمة (مثال: 50K+, 99.9%)',
        'projects.form_metric_label':
            'مسمى المؤشر (مثال: مستخدم نشط، سرعة التحميل)',
        'projects.form_add_metric': 'إضافة مؤشر',
        'projects.form_gallery_title': 'معرض لقطات المشروع والتطبيقات',
        'projects.form_gallery_desc':
            'ارفع لقطات شاشات عالية الدقة ونماذج واجهات التطبيقات والمخرجات.',
        'projects.form_upload_gallery': 'رفع لقطات للمعرض',
        'projects.form_save_btn': 'حفظ المشروع',

        // Employees Forms
        'employees.add_title': 'إضافة موظف جديد',
        'employees.add_desc':
            'إنشاء حساب جديد للموظف للوصول إلى لوحة التحكم بصلاحيات فريق العمل.',
        'employees.edit_title': 'تعديل بيانات الموظف',
        'employees.edit_desc':
            'تحديث بيانات تسجيل الدخول والمسميات الوظيفية وحالة الحساب.',
        'employees.info_title': 'بيانات الموظف والحساب',
        'employees.info_desc':
            'أدخل بيانات تسجيل الدخول والمعلومات الوظيفية للموظف.',
        'employees.full_name': 'الاسم الكامل *',
        'employees.email_address': 'البريد الإلكتروني *',
        'employees.password': 'كلمة المرور الابتدائية * (8 أحرف على الأقل)',
        'employees.new_password':
            'كلمة المرور الجديدة (اتركها فارغة للإبقاء على الحالية)',
        'employees.system_role': 'صلاحية النظام',
        'employees.role_employee': 'موظف (عضو فريق العمل)',
        'employees.account_status': 'حالة الحساب *',
        'employees.title_en': 'المسمى الوظيفي (EN)',
        'employees.title_ar': 'المسمى الوظيفي (AR)',
        'employees.phone_number': 'رقم الهاتف',
        'employees.save_btn': 'حفظ الموظف',

        // Admins Forms
        'admins.add_title': 'إضافة مسؤول نظام جديد',
        'admins.add_desc':
            'إنشاء حساب مسؤول بصلاحيات كاملة لإدارة لوحة التحكم والموظفين والمشاريع.',
        'admins.edit_title': 'تعديل بيانات مسؤول النظام',
        'admins.edit_desc':
            'تحديث بيانات الدخول والمسمى الإداري وحالة الصلاحية الأمنية.',
        'admins.info_title': 'بيانات حساب المسؤول',
        'admins.info_desc':
            'أدخل بيانات تسجيل الدخول والمسمى الإداري لمسؤول النظام.',
        'admins.system_authority': 'مستوى الصلاحية في النظام',
        'admins.authority_full': 'مسؤول نظام (تحكم كامل بالمنصة)',
        'admins.title_en': 'المسمى الإداري (EN)',
        'admins.title_ar': 'المسمى الإداري (AR)',
        'admins.save_btn': 'حفظ مسؤول النظام',

        // Categories Forms
        'categories.add_title': 'إضافة تصنيف جديد',
        'categories.add_desc':
            'إنشاء تصنيف للمشاريع وسابقة الأعمال بتسميات ثنائية اللغة (عربي وإنجليزي).',
        'categories.edit_title': 'تعديل بيانات التصنيف',
        'categories.edit_desc':
            'تحديث تصنيف المشاريع والترتيب والمعرف اللاتيني.',
        'categories.info_title': 'بيانات التصنيف',
        'categories.info_desc':
            'حدد الاسم باللغتين الإنجليزية والعربية لتصنيف المشاريع التابعة له.',
        'categories.name_en': 'اسم التصنيف (باللغة الإنجليزية) *',
        'categories.name_ar': 'اسم التصنيف (باللغة العربية) *',
        'categories.slug_label': 'المعرف اللاتيني (Slug)',
        'categories.slug_hint':
            '(اختياري، يتم توليده تلقائياً من الاسم الإنجليزي)',
        'categories.order_label': 'ترتيب الظهور',
        'categories.desc_en': 'الوصف (بالإنجليزية)',
        'categories.desc_ar': 'الوصف (بالعربية)',
        'categories.is_active_label': 'تصنيف نشط (متاح لربط المشاريع به)',
        'categories.save_btn': 'حفظ التصنيف',

        // Profile & Account Settings
        'profile.settings': 'إعدادات الملف الشخصي',
        'profile.title': 'بيانات الملف الشخصي',
        'profile.desc':
            'تحديث صورتك الشخصية، معلوماتك الأساسية وبيانات الاتصال الخاصة بك.',
        'profile.photo': 'الصورة الشخصية',
        'profile.photo_hint':
            'صيغ PNG أو JPG أو WEBP أو GIF بحجم أقصى 5 ميجابايت. يُفضل استخدام صورة مربعة.',
        'profile.upload_photo': 'رفع صورة شخصية',
        'profile.change_photo': 'تغيير الصورة',
        'profile.remove_photo': 'حذف الصورة',
        'profile.name': 'الاسم الكامل',
        'profile.email': 'البريد الإلكتروني',
        'profile.phone': 'رقم الهاتف',
        'profile.job_title': 'المسمى الوظيفي',
        'profile.job_title_ar': 'المسمى الوظيفي (بالعربية)',
        'profile.role': 'نوع الحساب / الصلاحية',
        'profile.status': 'حالة الحساب',
        'profile.unverified_email': 'بريدك الإلكتروني غير مفعّل بعد.',
        'profile.resend_verification': 'انقر هنا لإعادة إرسال رابط التفعيل.',
        'profile.verification_sent':
            'تم إرسال رابط تفعيل جديد إلى بريدك الإلكتروني.',
        'profile.saved': 'تم حفظ بيانات الملف الشخصي بنجاح.',
    },
};

const I18nContext = createContext<I18nContextType | null>(null);

function getInitialLocale(): Locale {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'ar' || stored === 'en') return stored;
    const cookieMatch = document.cookie.match(/ofoq_locale=(ar|en)/);
    if (cookieMatch) return cookieMatch[1] as Locale;
    return 'en';
}

function applyHtmlDirection(locale: Locale) {
    if (typeof document === 'undefined') return;
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
    localStorage.setItem(STORAGE_KEY, locale);
    document.cookie = `ofoq_locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

    const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';
    const isRtl = locale === 'ar';

    useEffect(() => {
        applyHtmlDirection(locale);
    }, [locale]);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        applyHtmlDirection(newLocale);
    };

    const toggleLocale = () => {
        const next = locale === 'ar' ? 'en' : 'ar';
        setLocale(next);
    };

    const t = (key: string, fallback?: string): string => {
        const table = translations[locale];
        if (table && table[key] !== undefined) {
            return table[key];
        }
        // Fallback to English dictionary
        const enTable = translations.en;
        if (enTable && enTable[key] !== undefined) {
            return enTable[key];
        }
        return fallback || key;
    };

    /**
     * Extracts localized text from bilingual objects { en: '...', ar: '...' } or strings.
     * When locale === 'en', guarantees strictly English with zero Arabic.
     * When locale === 'ar', guarantees strictly Arabic (or falls back if missing).
     */
    const localized = (
        value:
            | { en?: string | null; ar?: string | null }
            | string
            | null
            | undefined,
    ): string => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        if (locale === 'ar') {
            return value.ar || value.en || '';
        }
        return value.en || value.ar || '';
    };

    const formatDate = (
        date: string | Date,
        options?: Intl.DateTimeFormatOptions,
    ): string => {
        const d = typeof date === 'string' ? new Date(date) : date;
        const defaultOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            ...options,
        };
        return d.toLocaleDateString(
            locale === 'ar' ? 'ar-EG' : 'en-US',
            defaultOptions,
        );
    };

    const contextValue = useMemo(
        () => ({
            locale,
            dir,
            isRtl,
            setLocale,
            toggleLocale,
            t,
            localized,
            formatDate,
        }),
        [locale, dir, isRtl],
    );

    return (
        <I18nContext.Provider value={contextValue}>
            {children}
        </I18nContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useTranslation must be used within an I18nProvider');
    }
    return context;
}
