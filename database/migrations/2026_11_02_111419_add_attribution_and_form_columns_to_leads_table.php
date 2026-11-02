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
            $table->string('utm_source', 100)->nullable()->index()->after('source');
            $table->string('utm_medium', 100)->nullable()->after('utm_source');
            $table->string('utm_campaign', 150)->nullable()->index()->after('utm_medium');
            $table->string('utm_content', 150)->nullable()->after('utm_campaign');
            $table->string('form_name', 120)->nullable()->index()->after('utm_content');
            $table->text('landing_page')->nullable()->after('form_name');
            $table->text('referrer')->nullable()->after('landing_page');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropIndex(['utm_source']);
            $table->dropIndex(['utm_campaign']);
            $table->dropIndex(['form_name']);
            $table->dropColumn([
                'utm_source',
                'utm_medium',
                'utm_campaign',
                'utm_content',
                'form_name',
                'landing_page',
                'referrer',
            ]);
        });
    }
};
