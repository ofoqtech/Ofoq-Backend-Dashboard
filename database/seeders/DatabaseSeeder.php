<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@ofoq.tech'],
            [
                'name' => 'Ofoq Admin',
                'role' => Role::Admin,
                'title' => [
                    'ar' => 'المدير التقني والمسؤول العام',
                    'en' => 'Technical Director & Admin',
                ],
                'phone' => '+20 100 000 0001',
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Employee Users
        User::firstOrCreate(
            ['email' => 'employee@ofoq.tech'],
            [
                'name' => 'Ahmad Tech',
                'role' => Role::Employee,
                'title' => [
                    'ar' => 'مهندس برمجيات وتطبيقات أول',
                    'en' => 'Senior Full Stack Engineer',
                ],
                'phone' => '+20 100 000 0002',
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        User::firstOrCreate(
            ['email' => 'sarah@ofoq.tech'],
            [
                'name' => 'Sarah Al-Mansoor',
                'role' => Role::Employee,
                'title' => [
                    'ar' => 'مهندسة واجهات وتجربة المستخدم',
                    'en' => 'UI/UX & Mobile Developer',
                ],
                'phone' => '+20 100 000 0003',
                'status' => 'active',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 3. Seed Categories
        $this->call(CategorySeeder::class);

        // 4. Seed Projects
        $this->call(ProjectSeeder::class);

        // 5. Seed Services & Budgets for CRM
        $this->call(ServiceSeeder::class);

        // 6. Seed CRM Leads
        $this->call(LeadSeeder::class);

        // 7. Seed WhatsApp Cloud API Integration (Account, Templates, Quick Replies)
        $this->call(WhatsAppSeeder::class);
    }
}
