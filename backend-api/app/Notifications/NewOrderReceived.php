<?php

namespace App\Notifications;

use App\Models\Order;
use App\Services\SettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewOrderReceived extends Notification
{
    use Queueable;

    public function __construct(public Order $order) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $dashboard = rtrim((string) app(SettingsService::class)->get('dashboard_url'), '/');

        return (new MailMessage)
            ->subject("New order {$this->order->order_number}")
            ->line("A new order was placed by {$this->order->customer_name} ({$this->order->customer_phone}).")
            ->line("Total: {$this->order->currency} ".number_format((float) $this->order->total, 2))
            ->line('Payment method: '.$this->order->payment_method->value)
            ->action('Open in dashboard', "{$dashboard}/orders/{$this->order->id}");
    }
}
