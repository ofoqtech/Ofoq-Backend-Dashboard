<?php

namespace App\Http\Controllers;

use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display a paginated listing of all inquiry alerts and notifications (newest to oldest).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $search = $request->query('search');
        $channelFilter = $request->query('channel');
        $statusFilter = $request->query('status');

        $query = Lead::query()
            ->with(['service', 'assignee'])
            ->latest('id');

        // Employee access scope: their assigned leads or unassigned
        if ($user->isEmployee()) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                    ->orWhereNull('assigned_to');
            });
        }

        // Live text search
        if (! empty($search)) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")
                    ->orWhere('phone', 'like', "%{$term}%")
                    ->orWhere('email', 'like', "%{$term}%")
                    ->orWhere('company', 'like', "%{$term}%")
                    ->orWhere('utm_campaign', 'like', "%{$term}%")
                    ->orWhere('form_name', 'like', "%{$term}%")
                    ->orWhere('service_name_snapshot', 'like', "%{$term}%");
            });
        }

        // Channel filter
        if (! empty($channelFilter) && $channelFilter !== 'all') {
            if ($channelFilter === 'meta') {
                $query->where(function ($q) {
                    $q->where('utm_source', 'like', '%meta%')
                        ->orWhere('utm_source', 'like', '%facebook%')
                        ->orWhere('utm_source', 'like', '%instagram%')
                        ->orWhere('utm_source', 'like', '%messenger%')
                        ->orWhere('utm_source', 'like', '%fb%')
                        ->orWhere('utm_source', 'like', '%ig%')
                        ->orWhere('source', 'meta')
                        ->orWhere('source', 'facebook')
                        ->orWhere('source', 'instagram');
                });
            } elseif ($channelFilter === 'tiktok') {
                $query->where(function ($q) {
                    $q->where('utm_source', 'like', '%tiktok%')
                        ->orWhere('utm_source', 'like', '%tt%')
                        ->orWhere('source', 'tiktok');
                });
            } elseif ($channelFilter === 'snapchat') {
                $query->where(function ($q) {
                    $q->where('utm_source', 'like', '%snap%')
                        ->orWhere('source', 'snapchat')
                        ->orWhere('source', 'snapshot');
                });
            } elseif ($channelFilter === 'linkedin') {
                $query->where(function ($q) {
                    $q->where('utm_source', 'like', '%linkedin%')
                        ->orWhere('utm_source', 'like', '%lnkd%')
                        ->orWhere('source', 'linkedin');
                });
            } elseif ($channelFilter === 'google') {
                $query->where(function ($q) {
                    $q->where('utm_source', 'like', '%google%')
                        ->orWhere('utm_source', 'like', '%adwords%')
                        ->orWhere('source', 'google');
                });
            } elseif ($channelFilter === 'other') {
                $query->where(function ($q) {
                    $q->where(function ($sub) {
                        $sub->whereNull('utm_source')
                            ->orWhere('utm_source', '');
                    })->whereNotIn('source', ['meta', 'facebook', 'instagram', 'tiktok', 'snapchat', 'snapshot', 'linkedin', 'google']);
                });
            }
        }

        // Status filter
        if (! empty($statusFilter) && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        $notifications = $query->paginate(15)->withQueryString();

        // Calculate summary KPI cards
        $totalAlerts = Lead::count();
        $todayAlerts = Lead::whereDate('created_at', today())->count();
        $newUncontacted = Lead::where('status', LeadStatus::New->value)->count();
        $unreadAlerts = $user->unreadNotifications()->count();

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
            'filters' => [
                'search' => $search ?? '',
                'channel' => $channelFilter ?? 'all',
                'status' => $statusFilter ?? 'all',
            ],
            'stats' => [
                'total_alerts' => $totalAlerts,
                'today_alerts' => $todayAlerts,
                'new_uncontacted' => $newUncontacted,
                'unread_alerts' => $unreadAlerts,
            ],
        ]);
    }

    /**
     * Mark one or all notifications as read for the authenticated user.
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $user = $request->user();
        $id = $request->input('id');
        $leadId = $request->input('lead_id');

        if ($leadId) {
            $user->unreadNotifications()
                ->where(function ($q) use ($leadId) {
                    $q->whereJsonContains('data->lead_id', (int) $leadId)
                        ->orWhereJsonContains('data->lead_id', (string) $leadId);
                })
                ->update(['read_at' => now()]);
        } elseif ($id) {
            $user->unreadNotifications()
                ->where('id', $id)
                ->update(['read_at' => now()]);
        } else {
            $user->unreadNotifications()->update(['read_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }
}
