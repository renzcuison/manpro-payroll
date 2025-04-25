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
        'cut_off',
        'working_days',

        'total_earnings',
        'total_deductions',

        'rate_monthly',
        'rate_daily',
        'rate_hourly',

        'is_received',
        'client_id',
        'user_id',
    ];

    public function benefits()
    {
        return $this->hasMany(PayslipBenefitsModel::class, 'payslip_id');
    }

    public function deductions()
    {
        return $this->hasMany(PayslipDeductionsModel::class, 'payslip_id');
    }

    public function earnings()
    {
        return $this->hasMany(PayslipEarningsModel::class, 'payslip_id');
    }

    public function leaves()
    {
        return $this->hasMany(PayslipLeavesModel::class, 'payslip_id');
    }

    public function paidLeaves()
    {
        return $this->hasMany(PayslipLeavesModel::class, 'payslip_id')->where('is_paid', true);
    }

    public function unpaidLeaves()
    {
        return $this->hasMany(PayslipLeavesModel::class, 'payslip_id')->where('is_paid', false);
    }
}
