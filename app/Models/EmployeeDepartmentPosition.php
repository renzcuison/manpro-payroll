<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDepartmentPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'department_id',
        'department_position_id',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function department()
    {
        return $this->belongsTo(DepartmentsModel::class, 'department_id');
    }

    public function departmentPosition()
    {
        return $this->belongsTo(DepartmentPositionsModel::class, 'department_position_id');
    }
}
