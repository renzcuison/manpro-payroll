<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipBenefitsModel extends Model
{
    use HasFactory;

    protected $table = 'payslip_benefits';

    protected $primaryKey = 'id';

    protected $fillable = [
        'payslip_id',
        'benefit_id',
        'employee_amount',
        'employer_amount',
    ];
}
