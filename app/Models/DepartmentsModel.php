<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentsModel extends Model
{
    use HasFactory;

    protected $table = 'departments';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'acronym',
        'description',
        'status',
        'client_id',
        'manager_id',
        'supervisor_id',
        'approver_id',
        'leave_limit'
    ];

    // Add this relationship to connect departments with their employees
    public function employees()
    {
        return $this->hasMany(UsersModel::class, 'department_id');
    }

    public function manager()
    {
        return $this->belongsTo(UsersModel::class, 'manager_id');
    }

    public function supervisor()
    {
        return $this->belongsTo(UsersModel::class, 'supervisor_id');
    }

    public function approver()
    {
        return $this->belongsTo(UsersModel::class, 'approver_id');
    }

    //positions
    public function employeeDepartmentPositions()
    {
        return $this->hasMany(EmployeeDepartmentPosition::class, 'department_id');
    }
    
    public function users()
    {
        // If you want to get users assigned to this department via the pivot table
        return $this->hasManyThrough(
            UsersModel::class,
            EmployeeDepartmentPosition::class,
            'department_id',           // Foreign key on employee_department_positions table
            'id',                     // Foreign key on users table
            'id',                     // Local key on departments table
            'user_id'                 // Local key on employee_department_positions table
        );
    }
}
