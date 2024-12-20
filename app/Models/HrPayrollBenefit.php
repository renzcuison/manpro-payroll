<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrPayrollBenefit extends Model
{
    use HasFactory;

    protected $table = 'hr_payroll_benefits';

    protected $primaryKey = 'addbenefit_id';

    protected $fillable = [
        'addbenefit_id',
        'payroll_id',
        'benefitlist_id',
        'list_name',
        'totalAmount',
        'type',
        'is_deleted',
        'deleted_by',
        'taxable',
        'exempt',
        'amountTotal',
        'emp_id',
    ];

    public $timestamps = false;
}
