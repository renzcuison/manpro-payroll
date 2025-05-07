<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipAllowancesModel extends Model
{
    use HasFactory;

    protected $table = 'payslip_allowances';

    protected $primaryKey = 'id';

    protected $fillable = [
        'payslip_id',
        'employee_allowance_id',
        'amount',
    ];

    public function employeeAllowance()
    {
        return $this->belongsTo(EmployeeAllowancesModel::class, 'employee_allowance_id');
    }
}
