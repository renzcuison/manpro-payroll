<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\Pivot;
use App\Models\HMODependents;

class HMOEmployeePlan extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo_employee_plan';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'hmo_plan_id',
        'enroll_date'
    ];

    public $timestamps = true;

    public function employee()
    {
    return $this->belongsTo(UsersModel::class, 'employee_id');
    }

    public function dependents()
    {
        return $this->hasMany(HMODependents::class, 'hmo_employee_id');
    }

}