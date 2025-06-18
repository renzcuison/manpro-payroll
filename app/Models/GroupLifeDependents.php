<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class GroupLifeDependents extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'group_life_dependents';

    protected $fillable = [
        'dependent_name',
        'relationship',
        'group_life_employee_id'
    ];

    public function employeePlan()
    {
        return $this->belongsTo(GroupLifeEmployeePlan::class, 'group_life_employee_id');
    }
}