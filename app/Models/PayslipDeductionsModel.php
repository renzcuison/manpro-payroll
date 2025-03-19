<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipDeductionsModel extends Model
{
    use HasFactory;
    
    protected $table = 'payslip_deductions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'payslip_id',
        'deduction_id',
        'amount',
    ];
}
