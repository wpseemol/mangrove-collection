<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Manual mobile-wallet payments (bKash / Nagad / Rocket "Send Money"):
 *  - payment_accounts: the wallet numbers customers send money to, managed by admins.
 *  - payments: every transaction ID a customer submits, reviewed by staff.
 *
 * Existing wallet numbers (settings) and order transaction IDs are carried over.
 */
return new class extends Migration
{
    private const WALLETS = ['bkash', 'nagad', 'rocket'];

    public function up(): void
    {
        if (Schema::hasTable('payments')) {
            return;
        }

        Schema::create('payment_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('method', 20);
            $table->string('account_type', 20)->default('personal');
            $table->string('account_number', 32);
            $table->string('account_name', 100)->nullable();
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['method', 'account_number']);
            $table->index(['method', 'is_active']);
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('method', 20);
            $table->string('account_type', 20)->nullable();
            $table->string('account_number', 32)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('BDT');
            $table->string('sender_number', 32)->nullable();
            $table->string('transaction_id', 32);
            $table->string('status', 20)->default('submitted')->index();
            $table->string('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['method', 'transaction_id']);
        });

        $this->moveWalletSettings();
        $this->moveOrderTransactions();

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['transaction_id', 'payment_sender_number']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('transaction_id')->nullable()->after('payment_status');
            $table->string('payment_sender_number', 32)->nullable()->after('transaction_id');
        });

        Schema::dropIfExists('payments');
        Schema::dropIfExists('payment_accounts');
    }

    private function moveWalletSettings(): void
    {
        $settings = DB::table('settings')
            ->whereIn('key', ['payment_methods', 'bkash_number', 'nagad_number', 'rocket_number'])
            ->pluck('value', 'key');

        $enabled = json_decode((string) ($settings['payment_methods'] ?? '["cod"]'), true) ?: ['cod'];

        foreach (self::WALLETS as $index => $wallet) {
            if ($number = $settings["{$wallet}_number"] ?? null) {
                DB::table('payment_accounts')->insert([
                    'method' => $wallet,
                    'account_type' => 'personal',
                    'account_number' => $number,
                    'is_active' => in_array($wallet, $enabled, true),
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        if ($settings->isNotEmpty()) {
            DB::table('settings')->updateOrInsert(['key' => 'cod_enabled'], [
                'group' => 'commerce',
                'type' => 'boolean',
                'is_public' => true,
                'is_encrypted' => false,
                'value' => in_array('cod', $enabled, true) ? '1' : '0',
                'updated_at' => now(),
            ]);
        }

        DB::table('settings')->whereIn('key', ['payment_methods', 'bkash_number', 'nagad_number', 'rocket_number'])->delete();
    }

    private function moveOrderTransactions(): void
    {
        DB::table('orders')->whereNotNull('transaction_id')->orderBy('id')->each(function (object $order) {
            $account = DB::table('payment_accounts')->where('method', $order->payment_method)->orderBy('sort_order')->first();

            DB::table('payments')->insert([
                'order_id' => $order->id,
                'payment_account_id' => $account?->id,
                'method' => $order->payment_method,
                'account_type' => $account?->account_type,
                'account_number' => $account?->account_number,
                'amount' => $order->total,
                'currency' => $order->currency,
                'sender_number' => $order->payment_sender_number,
                'transaction_id' => strtoupper($order->transaction_id),
                'status' => $order->payment_status === 'paid' ? 'verified' : 'submitted',
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ]);

            if ($order->payment_status === 'pending') {
                DB::table('orders')->where('id', $order->id)->update(['payment_status' => 'verifying']);
            }
        });
    }
};
