<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HMODependents extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo_dependents';

    protected $fillable = [
        'dependent_name',
        'relationship',
        'hmo_employee_id'
    ];

    public function employeePlan()
    {
        return $this->belongsTo(HMOEmployeePlan::class, 'hmo_employee_id');
    }
}