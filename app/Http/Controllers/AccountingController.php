<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PaymentSettle;
use App\Models\AccountingPaidTransaction;
use App\Models\AccountingAccount;
use App\Models\AccountingMethod;
use App\Models\AccountingGlobalRate;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AccountingController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            // get net income
            $netQuery = PaymentSettle::selectRaw('COUNT(settle_id) as count, SUM(settle_amount) as net')->first();
            $income = round($netQuery->net,2) ?? 0;
            $transCount = $netQuery->count ?? 0;

            // get gross
            $gross = PaymentSettle::where('account_type', 2)->sum('settle_amount');

            // get service expense
            $expense = AccountingPaidTransaction::where('tbl_accounting_paid_transactions.transaction_id', '!=', 0)->sum('amount_paid');

            // get personal expense
            $personal_expense = AccountingPaidTransaction::where('tbl_accounting_paid_transactions.transaction_id', '=', 0)->sum('amount_paid');

            // get total liability
            $liability = PaymentSettle::doesntHave('paid')->sum('settle_amount');
            $liability = round($liability,2);

            // get total discount
            $discount = PaymentSettle::where('discount', '!=' , 0)->sum('discount');
            $discount = round($discount,2);

            // Sales Graph Data Weekly
            $weeklyPaymentData = PaymentSettle::getWeeklyPaymentData();

            $total_expense = $expense+$personal_expense+$discount;
            $net = $gross-$personal_expense+$discount;
            
            return response()->json([
                'totals' => [
                    [
                        "name" =>'Income',
                        'value' => $income,
                        "slug" => 'income'
                    ],
                    [
                        "name" =>'Expense',
                        'value' => $total_expense,
                        "slug" => 'expense'
                    ],
                    [
                        "name" =>'Liability',
                        'value' => $liability,
                        "slug" => 'liability'
                    ],
                    [
                        "name" =>'Net Income',
                        'value' => $net,
                        "slug" => 'net'
                    ],
                ],
                'expenses' => [
                    [
                        "title" => "Personal Expenses",
                        "value" => $personal_expense,
                        "slug" => "personal_expenses"
                    ],
                    [
                        "title" => "Liability Expenses",
                        "value" => $expense,
                        "slug" => "liability_expenses"
                    ],
                    [
                        "title" => "Total Discount",
                        "value" => $discount,
                        "slug" => "discount"
                    ]
                ],
                'gross' => $gross,
                'transaction_count' => $transCount,
                'weeklyPaymentData' => $weeklyPaymentData
            ]);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 500);
        }
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function transactions()
    {
        try{
            $transactions = PaymentSettle::with([
                    'financeField'=> function ($query) {
                    $query->select('finance_id', 'finance_name');
                },'financePhase' => fn ($query) =>
                    $query->select('phase_id', 'phase_name', 'phase_space_id')->with('space:space_id,space_name')
                , 'task' => fn ($query) =>
                    $query->select('task_id', 'task_contact')->with('client:contact_id,contact_fname,contact_mname,contact_lname')
                , 'financeTransaction'
                ])->select(
                    'settle_id',
                    'phase_id',
                    'finance_id',
                    'task_id',
                    'user_id',
                    'settle_amount',
                    'date_created',
                    'status',
                    'account_type',
                    'rate',
                    'client_rate'
                    )->orderByDesc('date_created')->get();

                    $transactions->map(function($transaction) {
                        $date = Carbon::parse($transaction->date_created);
                        $formattedDate = $date->toDateString();
                        $transaction->date_created = $formattedDate;
                    });

            return response()->json($transactions);
        }
        catch(\Exception $e){
            throw($e);
        }
    }

    /**
     * Data fetch the accounting summary of transactions paid
     *
     * @return \Illuminate\Http\Response
     */
    public function summaryTransactions(Request $request)
    {
        try{
            $user = $request->user();
            $user_type = $user->user_type;
            $user_id = $user->user_id;

            $transactions = PaymentSettle::with([
                'financeField' => fn ($query) => $query->select('finance_id', 'finance_name'),
                'financePhase' => fn ($query) => $query->select('phase_id', 'phase_name', 'phase_space_id')->with('space:space_id,space_name'),
                'task' => fn ($query) => $query->select('task_id', 'task_contact')->with('client:contact_id,contact_fname,contact_mname,contact_lname'),
                'paid'
            ])
            ->has('paid')
            ->select(
                'settle_id',
                'phase_id',
                'finance_id',
                'task_id',
                'user_id',
                'settle_amount',
                'date_created',
                'status',
                'account_type',
                'rate',
                'client_rate'
            )
            ->orderByDesc('date_created')
            ->get();

            $transactions->transform(function ($transaction) {
                $transaction->date_created = Carbon::parse($transaction->date_created)->format('m/d/Y');
                return $transaction;
            });

            if ($user_type == 'Admin') {
                return response()->json($transactions);
            } else {
                $assigned = $transactions->filter(function ($transaction) use ($user_id) {
                    return optional($transaction->paid)->paid_by == $user_id;
                })->values();

                return response()->json($assigned);
            }

        }
        catch(\Exception $e){
            throw($e);
        }
    }
    /**
     * Data fetch the accounting accounts
     *
     * @return \Illuminate\Http\Response
     */
    public function getAccounts()
    {
        $accounts = AccountingAccount::all();

        return response()->json($accounts);
    }

    /**
     * Data fetch the accounting methods
     *
     * @return \Illuminate\Http\Response
     */
    public function getMethods()
    {
        $accounts = AccountingMethod::all();

        return response()->json($accounts);
    }
    /**
     * Pay liability function
     *
     * @return \Illuminate\Http\Response
     */
    public function payLiability(Request $request)
    {
        try {
            $transaction_id = $request->input("transaction_id");
            $account_id = $request->input("account_id");
            $method_id = $request->input("method_select");
            $date = $request->input("add_date");
            $description = $request->input("description");
            $client_rate = $request->input("client_rate");
            $fee = $request->input("fee");
            $paid_amount = $request->input("amount_paid");
            $user  = $request->user();

            // check if transaction exists
            $is_paid = AccountingPaidTransaction::where('transaction_id', $transaction_id)->first();

            if ($is_paid) {
                return response()->json(['success' => false, 'message: ' => 'transaction already been processed'], 500);
            }
            $pay = AccountingPaidTransaction::create([
                "transaction_id"   =>$transaction_id,
                "account_id"       =>$account_id,
                "method_id"        =>$method_id,
                "date_paid"        =>$date,
                "description"      =>$description,
                "client_rate"      =>$client_rate,
                "amount"           =>$fee,
                "amount_paid"      =>$paid_amount,
                "paid_by"          =>$user->user_id
            ]);

            if (!$pay) {
                return response()->json(['success' => false, 'message error: ' => "Failed to insert to data."]);
            }

            $transaction = PaymentSettle::find($transaction_id)->update(['account_type' => 3]);
    
            return response()->json(['success' => true, 'message: ' => 'Successfully added payment']);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message: ' => $th->getMessage(), 'data' => $transaction_id], 500);
        }
    }

    /**
     * Fetch transaction data by client and phase.
     *
     * @return \Illuminate\Http\Response
     */
    public function fetchTransactionsByClientPhase($id)
    {
        try {
            $transaction = PaymentSettle::with(['task' => fn ($query) => $query->select('task_id', 'task_contact')->with('client:contact_id,contact_fname,contact_mname,contact_lname,contact_location,contact_email,contact_cpnum')])->find($id);

            $task_id = $transaction->task_id;
            $phase_id = $transaction->phase_id;

            $transactions = PaymentSettle::with(['financeField','financePhase' => fn ($query) =>
            $query->select('phase_id', 'phase_name', 'phase_space_id')->with('space:space_id,space_name'), 'paid','task' => fn ($query) => $query->select('task_id', 'task_contact')->with('client:contact_id,contact_fname,contact_mname,contact_lname,contact_location,contact_email,contact_cpnum')])->where('phase_id',$phase_id)->where('task_id', $task_id)->get();

            return response()->json(['success' => true,'transaction' => $transaction, 'transactions' => $transactions]);
        } catch (\Throwable $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()],500);
        }
    }

    /**
     * Get recent rate.
     *
     * @return \Illuminate\Http\Response
     */
    public function getRate()
    {
        $rate = AccountingGlobalRate::orderByDesc('date_created')->first();

        return response($rate->rate);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    /**
     * Add transaction to Gross
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function addTransactionToGross(Request $request)
    {
        try {
            $id = $request->input('id');
            $transaction = PaymentSettle::findOrFail($id);
            $transaction->update(['account_type' => 2]);
            $transaction->save();

            echo response()->json(['message' => 'success']);
        } catch (\Throwable $th) {
            echo response()->json(['message' => 'Failed to add transaction to gross', 'error' => $th->getMessage()], 500);
        }
    }
}