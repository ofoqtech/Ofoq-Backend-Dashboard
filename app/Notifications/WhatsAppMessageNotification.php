<?php

namespace App\Notifications;

use App\Models\WhatsAppContact;
use App\Models\WhatsAppConversation;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WhatsAppMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public WhatsAppConversation $conversation,
        public WhatsAppContact $contact,
        public ?string $messagePreview = null
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $senderName = $this->contact->profile_name ?: ('+'.$this->contact->wa_id);

        return [
            'type' => 'whatsapp_message',
            'title' => "WhatsApp: {$senderName}",
            'message' => $this->messagePreview ?: 'Sent an attachment',
            'conversation_id' => $this->conversation->id,
            'contact_id' => $this->contact->id,
            'lead_id' => $this->conversation->lead_id,
        ];
    }
}
