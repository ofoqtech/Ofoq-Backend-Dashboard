<?php

namespace App\Notifications;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LeadAssignedNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(
        public Lead $lead,
        public ?User $assignedBy = null
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $serviceName = $this->lead->service_name_snapshot
            ?? ($this->lead->service?->name_en ?? $this->lead->service?->name_ar ?? 'Custom Solution / خدمة مخصصة');
        $channelLabel = $this->lead->channel_label ?? $this->lead->channel ?? 'Direct Website';
        $assignerName = $this->assignedBy?->name ?? 'Management / الإدارة';
        $dashboardUrl = url('/crm?selected='.$this->lead->id);

        $mail = (new MailMessage)
            ->subject("📋 You have been assigned a lead: {$this->lead->name} - Ofoq CRM")
            ->greeting("Hello {$notifiable->name},")
            ->line("You have been assigned a client lead by **{$assignerName}**. Please review the details below and reach out promptly:")
            ->line("**Client Name / اسم العميل:** {$this->lead->name}")
            ->line("**Phone / رقم الهاتف:** {$this->lead->phone}")
            ->line("**Service Requested / الخدمة المطلوبة:** {$serviceName}")
            ->line("**Acquisition Channel / قناة الاستقطاب:** {$channelLabel}");

        if ($this->lead->company) {
            $mail->line("**Company / الشركة:** {$this->lead->company}");
        }

        if ($this->lead->email) {
            $mail->line("**Email / البريد الإلكتروني:** {$this->lead->email}");
        }

        if ($this->lead->budget_range_snapshot) {
            $mail->line("**Budget Range / الميزانية التقديرية:** {$this->lead->budget_range_snapshot}");
        }

        if ($this->lead->utm_campaign) {
            $mail->line("**Campaign / الحملة الإعلانية:** {$this->lead->utm_campaign}");
        }

        if ($this->lead->notes) {
            $mail->line("**Initial Notes / ملاحظات:** {$this->lead->notes}");
        }

        return $mail
            ->action('Open Lead in CRM / فتح العميل في لوحة التحكم', $dashboardUrl)
            ->line('Tip: Contacting the client within 15 minutes significantly increases conversion rates.')
            ->salutation("Best regards,\nOfoq Technology CRM System");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'lead_assigned',
            'lead_id' => $this->lead->id,
            'name' => $this->lead->name,
            'phone' => $this->lead->phone,
            'service' => $this->lead->service_name_snapshot ?? ($this->lead->service?->name_en ?? 'Custom Solution'),
            'channel' => $this->lead->channel,
            'assigned_by' => $this->assignedBy?->name,
        ];
    }
}
