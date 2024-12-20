<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FinanceTransaction;
use App\Models\PaymentSettlement;
use App\Models\FinancePhase;
use App\Models\FinanceField;
use App\Models\FinanceFieldCA;
use App\Models\FinanceFieldHide;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class FinanceTransactionController extends Controller
{
    
    public function paymentSettle(Request $request)
    {
        $user_id = auth()->user()->user_id;
        $phase_id = $request->input('phaseId');
        $task_id = $request->input('taskId');
        $finance_id = $request->input('financeId');
        $amount_settled = $request->input('amount');
        $date = now(); // Use Laravel's helper function to get the current date and time

        // Check if transaction already exists
        $checkTransaction = PaymentSettlement::where('phase_id', $phase_id)
            ->where('finance_id', $finance_id)
            ->where('task_id', $task_id)
            ->exists();

        if ($checkTransaction) {
            return response()->json(['message' => 'Payment has been added already'], 500);
        } else {
            $financeTransaction = FinanceTransaction::where('val_phase_id', $phase_id)
                ->where('val_assign_to', $task_id)
                ->first();

            if (!$financeTransaction) {
                return response()->json(['message' => 'Transaction can\'t be found.'], 500);
            }

            $remittance = $financeTransaction->val_method;
            $php_rate = $financeTransaction->val_php_rate;
            $client_rate = $financeTransaction->val_client_rate;
            $transaction_id = $financeTransaction->val_id;

            PaymentSettlement::create([
                'remittance' => $remittance,
                'phase_id' => $phase_id,
                'finance_id' => $finance_id,
                'task_id' => $task_id,
                'user_id' => $user_id,
                'settle_amount' => $amount_settled,
                'date_created' => $date,
                'status' => 0,
                'transaction_id' => $transaction_id,
            ]);
            
            return response()->json(['message' => 'Transaction payment submitted.']);
        }
    }

    
    public function paymentSettleBlast(Request $request)
    {
        $user_id = auth()->user()->user_id;
        $phase_id = $request->input('phaseId');
        $task_id = $request->input('taskId');
        $date = now(); // Use Laravel's helper function to get the current date and time

        $finance_phase = FinanceField::where('finance_phase_id', $phase_id)->get();
        foreach ($finance_phase as $key => $phase){
            $item_id = $phase->finance_id;
            $amount = $phase->finance_value;

            // check finance item if it has custom amount or discount
            $custom_amount = FinanceFieldCA::where('custom_amount_task_id', $task_id)->where('custom_amount_field_id', $item_id)->first();
            if ($custom_amount) {
                $amount = $custom_amount->custom_amount_value;
            }

            $isExempted = FinanceFieldHide::where('hideshow_task_id', $task_id)->where('hideshow_field_id', $item_id)->exists();
            if (!$isExempted ) {
                // Check if transaction already exists
                $paymentSettlement  = PaymentSettlement::where('phase_id', $phase_id)
                    ->where('finance_id', $item_id)
                    ->where('task_id', $task_id)
                    ->first();
        
                if (!$paymentSettlement ) {
                    $financeTransaction = FinanceTransaction::where('val_phase_id', $phase_id)
                        ->where('val_assign_to', $task_id)
                        ->first();
        
                    if ($financeTransaction) {
                        $remittance = $financeTransaction->val_method;
                        $php_rate = $financeTransaction->val_php_rate;
                        $client_rate = $financeTransaction->val_client_rate;
                        $transaction_id = $financeTransaction->val_id;
            
                        PaymentSettlement::create([
                            'remittance' => $remittance,
                            'phase_id' => $phase_id,
                            'finance_id' => $item_id,
                            'task_id' => $task_id,
                            'user_id' => $user_id,
                            'settle_amount' => $amount,
                            'date_created' => $date,
                            'rate' => $php_rate,
                            'client_rate' => $client_rate,
                            'status' => 0,
                            'transaction_id' => $transaction_id,
                        ]);
                    }
        
                    // return response()->json(['message' => 'Payment has been added already'], 500);
                } else {
                    
                    // return response()->json(['message' => 'Transaction payment submitted.']);
                }
            }

        }
    }

    public function migrateTransactionsToAccounting()
    {
        $user_id = auth()->user()->user_id;
        $date = now(); // Use Laravel's helper function to get the current date and time
        $transactions = FinanceTransaction::
        join('finance_phase', 'finance_transaction.val_phase_id','=','finance_phase.phase_id')
        ->join('task', 'finance_transaction.val_assign_to','=','task.task_id')
        ->whereNotNull('val_phase_id')
        ->whereNotNull('val_assign_to')
        // ->toSql();
        ->get();

        foreach ($transactions as $key => $transaction) {
            $task_id = $transaction->task_id;
            $phase_id = $transaction->phase_id;
            $items = FinanceField::where('finance_phase_id',$transaction->phase_id)->get();
            foreach ($items as $i => $item) {
                $item_id = $item->finance_id;
                $amount = $item->finance_value;
                
                $isExempted = FinanceFieldHide::where('hideshow_task_id', $task_id)->where('hideshow_field_id', $item_id)->exists();
                if (!$isExempted ) {
                    // check finance item if it has custom amount or discount
                    $custom_amount = FinanceFieldCA::where('custom_amount_task_id', $task_id)->where('custom_amount_field_id', $item_id)->first();
                    if ($custom_amount) {
                        $amount = $custom_amount->custom_amount_value;
                        $item->prev_val = $item->finance_value;
                        $item->finance_value = $amount;
                    }

                    // Check if transaction already exists
                    $paymentSettlement  = PaymentSettlement::where('phase_id', $phase_id)
                    ->where('finance_id', $item_id)
                    ->where('task_id', $task_id)
                    ->first();
        
                    if (!$paymentSettlement ) {
                        $remittance = $transaction->val_method;
                        $php_rate = $transaction->val_php_rate;
                        $client_rate = $transaction->val_client_rate;
                        $transaction_id = $transaction->val_id;
            
                        PaymentSettlement::create([
                            'remittance' => $remittance,
                            'phase_id' => $phase_id,
                            'finance_id' => $item_id,
                            'task_id' => $task_id,
                            'user_id' => $user_id,
                            'settle_amount' => $amount,
                            'date_created' => $date,
                            'rate' => $php_rate,
                            'client_rate' => $client_rate,
                            'status' => 0,
                            'transaction_id' => $transaction_id,
                        ]);
                    }
                }

            }
            $transaction->fields = $items;
        }

        return response()->json('success');
    }
}