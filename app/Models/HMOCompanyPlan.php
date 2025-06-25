<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HMOCompanyPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo_plans';

    protected $primaryKey = 'id';

    protected $fillable = [
        'hmo_company_id',
        'plan_name',
        'type',
        'employer_share',
        'employee_share',
    ];

    protected $dates = ['deleted_at'];

    public function company()
    {
        return $this->belongsTo(HMOCompany::class, 'hmo_company_id');
    }

    public function employees()
    {
        return $this->belongsToMany(
            UsersModel::class,
            'hmo_employee_plan',
            'hmo_plan_id',
            'employee_id'
        )
            ->using(HMOEmployeePlan::class)
            ->withPivot('enroll_date')
            ->withTimestamps();
    }

    public function assignedEmployees()
    {
        return $this->hasMany(HMOEmployeePlan::class, 'hmo_plan_id');
    }

    public function plan()
    {
        return $this->belongsTo(HMOCompanyPlan::class, 'hmo_plan_id');
    }
}
