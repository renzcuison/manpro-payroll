<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MilestoneReminder extends Notification
{
    use Queueable;

    public $type;
    public $milestoneDate;
    /**
     * Create a new notification instance.
     */
    public function __construct($type, $milestoneDate)
    {
        $this->type = $type;
        $this->milestoneDate = $milestoneDate;
    }

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
    public function toMail($notifiable)
    {
        return (new MailMessage())
            ->subject("Upcoming $this->type!")
            ->greeting("Hello {$notifiable->name},")
            ->line(
                "You have an upcoming $this->type on {$this->milestoneDate}."
            )
            ->line('Let’s celebrate this milestone together!')
            ->salutation('– Your Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
                //
            ];
    }
}