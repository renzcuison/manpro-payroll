<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipsModel extends Model
{
    use HasFactory;

    protected $table = 'payslips';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',

        'period_start',
        'period_end',

        'total_earnings',
        'total_deductions',

        'rate_monthly',
        'rate_daily',
        'rate_hourly',

        'is_received',
        'user_id',
    ];
}
