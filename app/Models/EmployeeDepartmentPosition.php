<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDepartmentPosition extends Model
{
    use HasFactory;

    protected $fillable = ['employee_id', 'assignment_id'];

    public function employee()
    {
        return $this->belongsTo(UsersModel::class, 'employee_id');
    }

    public function position()
    {
        return $this->belongsTo(DepartmentPositionAssignment::class, 'assignment_id');
    }
}