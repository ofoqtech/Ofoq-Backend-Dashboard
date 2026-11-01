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
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $serviceName = $this->lead->service_name_snapshot ?? ($this->lead->service?->name_en ?? 'Custom Solution');
        $budgetTier = $this->lead->budget_range_snapshot ?? 'Not specified';
        $dashboardUrl = url('/crm?selected='.$this->lead->id);

        return (new MailMessage)
            ->subject("🚀 New Project Inquiry: {$this->lead->name} - Ofoq CRM")
            ->greeting('Hello Ofoq Team,')
            ->line("A new client inquiry was just submitted via the website 'Get In Touch' contact form.")
            ->line("**Client Name:** {$this->lead->name}")
            ->line("**Mobile:** {$this->lead->phone}")
            ->line("**Service Requested:** {$serviceName}")
            ->line("**Budget Range:** {$budgetTier}")
            ->when($this->lead->email, fn ($mail) => $mail->line("**Email:** {$this->lead->email}"))
            ->when($this->lead->company, fn ($mail) => $mail->line("**Company:** {$this->lead->company}"))
            ->action('Open Lead in CRM Dashboard', $dashboardUrl)
            ->line('Quick response within 1 hour significantly increases conversion rates.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'lead_id' => $this->lead->id,
            'name' => $this->lead->name,
            'phone' => $this->lead->phone,
            'service' => $this->lead->service_name_snapshot,
            'budget' => $this->lead->budget_range_snapshot,
            'status' => $this->lead->status->value,
        ];
    }
}
