<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\Pivot;
use App\Models\GroupLifeDependents;

class GroupLifeEmployeePlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'group_life_employee_plan';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'group_life_plan_id',
        'enroll_date'
    ];

    public $timestamps = true;

    public function employee()
    {
    return $this->belongsTo(UsersModel::class, 'employee_id');
    }

    public function dependents()
    {
        return $this->hasMany(GroupLifeDependents::class, 'group_life_employee_id');
    }

    // Add this relationship!
    public function plan()
    {
        return $this->belongsTo(GroupLifeCompanyPlan::class, 'group_life_plan_id');
    }

}