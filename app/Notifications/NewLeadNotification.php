<?php

namespace App\Notifications;

use App\Models\Lead;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLeadNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Lead $lead) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $serviceName = $this->lead->service_name_snapshot ?? ($this->lead->service?->name_en ?? 'Custom Solution');
        $budgetTier = $this->lead->budget_range_snapshot ?? 'Not specified';
        $dashboardUrl = url('/crm?selected='.$this->lead->id);

        $mail = (new MailMessage)
            ->subject("🚀 New Project Inquiry: {$this->lead->name} - Ofoq CRM")
            ->greeting('Hello Ofoq Team,')
            ->line("A new client inquiry was just submitted via the website 'Get In Touch' contact form.")
            ->line("**Client Name:** {$this->lead->name}")
            ->line("**Mobile:** {$this->lead->phone}")
            ->line("**Service Requested:** {$serviceName}")
            ->line("**Budget Range:** {$budgetTier}");

        if ($this->lead->email) {
            $mail->line("**Email:** {$this->lead->email}");
        }

        if ($this->lead->company) {
            $mail->line("**Company:** {$this->lead->company}");
        }

        if ($this->lead->internal_notes) {
            $mail->line("**Message / Details:** {$this->lead->internal_notes}");
        }

        if ($this->lead->channel_label) {
            $mail->line("**Marketing Channel:** {$this->lead->channel_label}");
        }

        if ($this->lead->landing_page) {
            $mail->line("**Landing Page:** {$this->lead->landing_page}");
        }

        return $mail
            ->action('Open Lead in CRM Dashboard', $dashboardUrl)
            ->line('Quick response within 1 hour significantly increases conversion rates.')
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
            'type' => 'new_lead',
            'notification_type' => 'new_lead',
            'lead_id' => $this->lead->id,
            'name' => $this->lead->name,
            'phone' => $this->lead->phone,
            'email' => $this->lead->email,
            'company' => $this->lead->company,
            'channel' => $this->lead->channel,
            'channel_label' => $this->lead->channel_label,
            'channel_label_ar' => $this->lead->channel_label_ar,
            'service' => $this->lead->service_name_snapshot,
            'service_name_snapshot' => $this->lead->service_name_snapshot,
            'budget' => $this->lead->budget_range_snapshot,
            'status' => $this->lead->status->value,
            'message' => $this->lead->internal_notes,
            'created_at' => $this->lead->created_at?->diffForHumans() ?? now()->diffForHumans(),
        ];
    }
}
