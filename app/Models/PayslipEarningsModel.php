<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipEarningsModel extends Model
{
    use HasFactory;

    protected $table = 'payslip_earnings';

    protected $primaryKey = 'id';

    protected $fillable = [
        'payslip_id',
        'earning_id',
        'amount',
    ];
}
