<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class PaymentSettle extends Model
{
    use HasFactory;
    protected $table = 'tbl_payment_settled';
    
    protected $primaryKey = 'settle_id';

    protected $guarded = [];
    
    public $timestamps = false;

    public function financeField()
    {
        return $this->belongsTo(FinanceField::class, 'finance_id', 'finance_id');
    }

    public function financePhase()
    {
        return $this->belongsTo(FinancePhase::class, 'phase_id', 'phase_id');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id', 'task_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function paid()
    {
        return $this->hasOne(AccountingPaidTransaction::class, 'transaction_id');
    }

    public function financeTransaction()
    {
        return $this->belongsTo(FinanceTransaction::class, 'val_id','transaction_id');
    }

    public static function getWeeklyPaymentData()
    {
        return self::select(
            DB::raw('SUM(settle_amount) AS data'),
            DB::raw('DATE(date_created) as date')
        )
        ->where('date_created', '>', now()->subWeek())
        ->groupBy(DB::raw('DATE(date_created)'))
        ->get();
    }
}