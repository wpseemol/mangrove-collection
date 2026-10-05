<?php

namespace App\Notifications;

use App\Models\Order;
use App\Services\SettingsService;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPlaced extends Notification
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
        $settings = app(SettingsService::class);
        $order = $this->order->loadMissing('items');

        $message = (new MailMessage)
            ->subject("Order {$order->order_number} received")
            ->greeting("Hi {$order->customer_name},")
            ->line("Thank you for your order. We've received order **{$order->order_number}** and will start processing it shortly.");

        foreach ($order->items as $item) {
            $variant = $item->variant_title ? " ({$item->variant_title})" : '';
            $message->line("- {$item->product_name}{$variant} × {$item->quantity}: {$order->currency} ".number_format((float) $item->line_total, 2));
        }

        return $message
            ->line("Shipping: {$order->currency} ".number_format((float) $order->shipping_cost, 2))
            ->line("**Total: {$order->currency} ".number_format((float) $order->total, 2).'**')
            ->action('View your orders', rtrim((string) $settings->get('storefront_url'), '/').'/account/orders')
            ->salutation('— '.$settings->get('site_name'));
    }
}
