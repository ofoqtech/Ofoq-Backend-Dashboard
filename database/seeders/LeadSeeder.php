<?php

namespace Database\Seeders;

use App\Enums\LeadPriority;
use App\Enums\LeadStatus;
use App\Models\Lead;
use App\Models\Service;
use App\Models\ServiceBudget;
use App\Models\User;
use Illuminate\Database\Seeder;

class LeadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employee = User::where('email', 'employee@ofoq.tech')->first();
        $designer = User::where('email', 'sarah@ofoq.tech')->first();
        $admin = User::where('email', 'admin@ofoq.tech')->first();

        $webService = Service::where('slug', 'web-development')->first();
        $mobileService = Service::where('slug', 'mobile-apps')->first();
        $erpService = Service::where('slug', 'erp-systems')->first();
        $aiService = Service::where('slug', 'ai-automation')->first();

        $webBudgetGrowth = ServiceBudget::where('tier_key', 'growth')->first();
        $mobileBudgetFull = ServiceBudget::where('tier_key', 'full_mobile')->first();
        $erpBudgetComplete = ServiceBudget::where('tier_key', 'complete_erp')->first();
        $aiAssistantBudget = ServiceBudget::where('tier_key', 'ai_assistant')->first();
        $webStarterBudget = ServiceBudget::where('tier_key', 'starter')->first();

        $leadsData = [
            [
                'lead' => [
                    'name' => 'Eng. Tarek Mahmoud (Skyline Logistics)',
                    'phone' => '+201098765432',
                    'email' => 'tarek@skylinelogistics.eg',
                    'company' => 'Skyline Freight & Logistics',
                    'service_id' => $erpService?->id,
                    'service_budget_id' => $erpBudgetComplete?->id,
                    'service_name_snapshot' => 'ERP & Enterprise Solutions',
                    'budget_range_snapshot' => '$6,000 - $12,000 (180,000 - 360,000 EGP)',
                    'status' => LeadStatus::New,
                    'priority' => LeadPriority::Urgent,
                    'assigned_to' => $employee?->id,
                    'internal_notes' => 'Looking for full logistics ERP with multi-warehouse tracking. Needs immediate callback.',
                    'source' => 'get_in_touch',
                    'ip_address' => '197.34.120.4',
                    'created_at' => now()->subHours(2),
                ],
                'activities' => [
                    [
                        'type' => 'created',
                        'content' => 'Lead submitted via website Get In Touch form.',
                        'user_id' => null,
                        'created_at' => now()->subHours(2),
                    ],
                ],
            ],
            [
                'lead' => [
                    'name' => 'Dr. Mona Radwan (HealthCare Plus)',
                    'phone' => '+201123456789',
                    'email' => 'dr.mona@healthcareplus.com',
                    'company' => 'HealthCare Plus Clinics',
                    'service_id' => $mobileService?->id,
                    'service_budget_id' => $mobileBudgetFull?->id,
                    'service_name_snapshot' => 'Mobile App Development',
                    'budget_range_snapshot' => '$4,000 - $8,000 (120,000 - 240,000 EGP)',
                    'status' => LeadStatus::Contacted,
                    'priority' => LeadPriority::High,
                    'assigned_to' => $designer?->id,
                    'internal_notes' => 'Spoke on WhatsApp. Doctor wants patient booking and telehealth video calls integrated.',
                    'contacted_at' => now()->subDays(1),
                    'next_follow_up_at' => now()->addDays(2),
                    'source' => 'get_in_touch',
                    'ip_address' => '156.204.88.19',
                    'created_at' => now()->subDays(1)->subHours(3),
                ],
                'activities' => [
                    [
                        'type' => 'created',
                        'content' => 'Lead submitted via website Get In Touch form.',
                        'user_id' => null,
                        'created_at' => now()->subDays(1)->subHours(3),
                    ],
                    [
                        'type' => 'status_change',
                        'content' => 'Status changed from New to Contacted by Sarah Al-Mansoor.',
                        'user_id' => $designer?->id,
                        'created_at' => now()->subDays(1),
                    ],
                    [
                        'type' => 'note',
                        'content' => 'Shared our previous medical app portfolio over WhatsApp. She was very impressed.',
                        'user_id' => $designer?->id,
                        'created_at' => now()->subDays(1)->addMinutes(30),
                    ],
                ],
            ],
            [
                'lead' => [
                    'name' => 'Karim Al-Husseini (Cairo Artisan Coffee)',
                    'phone' => '+201011223344',
                    'email' => 'karim@cairoartisan.com',
                    'company' => 'Cairo Artisan Specialty Coffee',
                    'service_id' => $webService?->id,
                    'service_budget_id' => $webBudgetGrowth?->id,
                    'service_name_snapshot' => 'Web Development & Platforms',
                    'budget_range_snapshot' => '$2,000 - $5,000 (60,000 - 150,000 EGP)',
                    'status' => LeadStatus::Qualified,
                    'priority' => LeadPriority::Medium,
                    'assigned_to' => $employee?->id,
                    'internal_notes' => 'E-commerce platform with subscription box model and Paymob/Fawry payment integration.',
                    'contacted_at' => now()->subDays(3),
                    'next_follow_up_at' => now()->addDays(1),
                    'source' => 'get_in_touch',
                    'ip_address' => '41.47.190.22',
                    'created_at' => now()->subDays(3)->subHours(5),
                ],
                'activities' => [
                    [
                        'type' => 'created',
                        'content' => 'Lead submitted via website Get In Touch form.',
                        'user_id' => null,
                        'created_at' => now()->subDays(3)->subHours(5),
                    ],
                    [
                        'type' => 'status_change',
                        'content' => 'Status changed to Qualified following technical scoping call.',
                        'user_id' => $employee?->id,
                        'created_at' => now()->subDays(2),
                    ],
                ],
            ],
            [
                'lead' => [
                    'name' => 'Youssef El-Shamy (Gulf Horizon Real Estate)',
                    'phone' => '+971501234567',
                    'email' => 'youssef@gulfhorizon.ae',
                    'company' => 'Gulf Horizon Properties UAE',
                    'service_id' => $aiService?->id,
                    'service_budget_id' => $aiAssistantBudget?->id,
                    'service_name_snapshot' => 'AI Solutions & Automation',
                    'budget_range_snapshot' => '$1,200 - $3,000 (35,000 - 90,000 EGP)',
                    'status' => LeadStatus::ProposalSent,
                    'priority' => LeadPriority::High,
                    'assigned_to' => $admin?->id,
                    'internal_notes' => 'Sent formal technical proposal for WhatsApp AI property bot + CRM integration. Reviewing with board.',
                    'contacted_at' => now()->subDays(5),
                    'next_follow_up_at' => now()->addDays(3),
                    'source' => 'get_in_touch',
                    'ip_address' => '94.200.12.80',
                    'created_at' => now()->subDays(6),
                ],
                'activities' => [
                    [
                        'type' => 'created',
                        'content' => 'Lead submitted from Dubai UAE via website contact.',
                        'user_id' => null,
                        'created_at' => now()->subDays(6),
                    ],
                    [
                        'type' => 'proposal_sent',
                        'content' => 'Formal proposal PDF (v1.2) sent to youssef@gulfhorizon.ae with total value $2,800.',
                        'user_id' => $admin?->id,
                        'created_at' => now()->subDays(4),
                    ],
                ],
            ],
            [
                'lead' => [
                    'name' => 'Nader Mansour (Al-Ahram Hardware)',
                    'phone' => '+201200112233',
                    'email' => 'nader@ahramtools.com',
                    'company' => 'Al-Ahram Industrial Tools',
                    'service_id' => $webService?->id,
                    'service_budget_id' => $webStarterBudget?->id,
                    'service_name_snapshot' => 'Web Development & Platforms',
                    'budget_range_snapshot' => '$500 - $1,500 (15,000 - 45,000 EGP)',
                    'status' => LeadStatus::Won,
                    'priority' => LeadPriority::Medium,
                    'assigned_to' => $employee?->id,
                    'internal_notes' => 'Contract signed! 50% deposit received via bank transfer. Converted into active project.',
                    'contacted_at' => now()->subDays(10),
                    'source' => 'direct',
                    'ip_address' => '197.45.20.10',
                    'created_at' => now()->subDays(12),
                ],
                'activities' => [
                    [
                        'type' => 'status_change',
                        'content' => 'Deal closed and marked as Won! Project kickoff scheduled.',
                        'user_id' => $employee?->id,
                        'created_at' => now()->subDays(2),
                    ],
                ],
            ],
        ];

        foreach ($leadsData as $data) {
            $activities = $data['activities'] ?? [];
            $leadData = $data['lead'];

            $lead = Lead::create($leadData);

            foreach ($activities as $act) {
                $lead->activities()->create($act);
            }
        }
    }
}
