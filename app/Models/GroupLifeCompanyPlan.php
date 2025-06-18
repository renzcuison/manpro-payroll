<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupLifeCompanyPlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'group_life_plans';

    protected $primaryKey = 'id';

    protected $fillable = [
        'group_life_company_id',
        'plan_name',
        'type',
        'employer_share',
        'employee_share'
    ];

    public function company() {
        return $this->belongsTo(GroupLifeCompany::class, 'group_life_company_id');
    }

    public function employees()
    {
        return $this->belongsToMany(
            UsersModel::class,
            'group_life_employee_plan',
            'group_life_plan_id',
            'employee_id'
        )
        ->using(GroupLifeEmployeePlan::class)
        ->withPivot('enroll_date')
        ->withTimestamps();
    }
}
