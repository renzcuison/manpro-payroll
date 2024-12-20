<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrPayrollAllRecord extends Model
{
    use HasFactory;

    protected $table = 'hr_payroll_allrecords';

    protected $primaryKey = 'payroll_id';

    public $timestamps = false;
}
