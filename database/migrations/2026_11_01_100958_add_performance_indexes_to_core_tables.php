<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->index('status', 'leads_status_index');
            $table->index('priority', 'leads_priority_index');
            $table->index('created_at', 'leads_created_at_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'users_role_index');
            $table->index('status', 'users_status_index');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index('category', 'projects_category_index');
            $table->index('is_featured', 'projects_is_featured_index');
            $table->index('created_at', 'projects_created_at_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->index('order', 'categories_order_index');
            $table->index('is_active', 'categories_is_active_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex('leads_status_index');
            $table->dropIndex('leads_priority_index');
            $table->dropIndex('leads_created_at_index');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_role_index');
            $table->dropIndex('users_status_index');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('projects_category_index');
            $table->dropIndex('projects_is_featured_index');
            $table->dropIndex('projects_created_at_index');
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->dropIndex('categories_order_index');
            $table->dropIndex('categories_is_active_index');
        });
    }
};
