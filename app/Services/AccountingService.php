<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Purchase;
use App\Models\RecurringPayment;
use App\Models\RetailSale;
use App\Models\Sell;

class AccountingService
{
    public function syncPurchaseAccount(Purchase $purchase): Account
    {
        $total = (float) ($purchase->total_amount ?? 0);
        $paid = (float) ($purchase->paid_amount ?? 0);
        $due = max(0, $total - $paid);
        $status = $paid <= 0 ? 'unpaid' : ($due <= 0 ? 'paid' : 'partial');

        return Account::query()->updateOrCreate(
            [
                'source_type' => 'purchase',
                'source_id' => $purchase->id,
                'entry_type' => 'purchase_payable',
            ],
            [
                'warehouse_id' => (int) ($purchase->purchase_form ?? 0) ?: null,
                'reference' => $purchase->po_number,
                'total_amount' => $total,
                'paid_amount' => min($paid, $total),
                'due_amount' => $due,
                'payment_status' => $status,
                'transaction_date' => $purchase->created_at?->toDateString() ?? now()->toDateString(),
                'note' => $purchase->note,
                'meta' => [
                    'purchase_to' => $purchase->purchase_to,
                    'purchase_status' => $purchase->status,
                ],
            ]
        );
    }

    public function syncSellAccount(Sell $sell): Account
    {
        $total = max(0, (int) ($sell->quantity ?? 0)) * max(0, (float) ($sell->selling_price ?? 0));
        $status = strtolower((string) ($sell->status ?? ''));
        $isPaid = in_array($status, ['paid', 'completed', 'received'], true);
        $paid = $isPaid ? $total : 0.0;
        $due = max(0, $total - $paid);

        return Account::query()->updateOrCreate(
            [
                'source_type' => 'sell',
                'source_id' => $sell->id,
                'entry_type' => 'sell_receivable',
            ],
            [
                'warehouse_id' => (int) ($sell->selling_from ?? 0) ?: null,
                'reference' => $sell->po_number,
                'total_amount' => $total,
                'paid_amount' => $paid,
                'due_amount' => $due,
                'payment_status' => $due <= 0 ? 'paid' : 'unpaid',
                'transaction_date' => $sell->created_at?->toDateString() ?? now()->toDateString(),
                'meta' => [
                    'sold_to' => $sell->sold_to,
                    'product_id' => $sell->product_id,
                ],
            ]
        );
    }

    public function syncRetailSaleAccount(RetailSale $sale): Account
    {
        $total = (float) ($sale->total_amount ?? 0);

        return Account::query()->updateOrCreate(
            [
                'source_type' => 'retail_sale',
                'source_id' => $sale->id,
                'entry_type' => 'retail_receivable',
            ],
            [
                'warehouse_id' => (int) ($sale->warehouse_id ?? 0) ?: null,
                'reference' => $sale->reference_number,
                'total_amount' => $total,
                'paid_amount' => $total,
                'due_amount' => 0,
                'payment_status' => 'paid',
                'transaction_date' => $sale->created_at?->toDateString() ?? now()->toDateString(),
                'note' => $sale->note,
                'meta' => [
                    'payment_method' => $sale->payment_method,
                    'sold_by' => $sale->sold_by,
                ],
            ]
        );
    }

    public function createPurchasePaymentAccount(Purchase $purchase, RecurringPayment $payment): Account
    {
        $amount = max(0, (float) ($payment->amount ?? 0));

        return Account::query()->create([
            'warehouse_id' => (int) ($purchase->purchase_form ?? 0) ?: null,
            'source_type' => 'recurring_payment',
            'source_id' => (int) $payment->id,
            'entry_type' => 'purchase_payment',
            'reference' => $purchase->po_number,
            'total_amount' => $amount,
            'paid_amount' => $amount,
            'due_amount' => 0,
            'payment_status' => 'paid',
            'transaction_date' => $payment->paid_on?->toDateString() ?? now()->toDateString(),
            'note' => $payment->note,
            'meta' => [
                'purchase_id' => $purchase->id,
                'purchase_payment_status' => $purchase->payment_status,
                'purchase_due_amount' => (float) ($purchase->due_amount ?? 0),
                'frequency' => $payment->frequency,
            ],
        ]);
    }

    public function deleteSourceAccount(string $sourceType, int $sourceId): void
    {
        Account::query()
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->delete();
    }
}
