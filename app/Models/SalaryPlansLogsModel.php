<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryPlansLogsModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'salary_plans_logs';

    protected $primaryKey = 'id';

    protected $fillable = [
        'old_salary_grade',
        'new_salary_grade',
        'old_amount',
        'new_amount',
        'client_id',
        'admin_id',
        'employee_id',
    ];
}
