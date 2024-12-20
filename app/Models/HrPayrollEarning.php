<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrPayrollEarning extends Model
{
    use HasFactory;

    protected $table = 'hr_payroll_earnings';

    protected $primaryKey = 'earnings_id';

    public $timestamps = false;
}
