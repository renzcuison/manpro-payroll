<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentPositionAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'department_id', 
        'department_position_id'];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function position()
    {
        return $this->belongsTo(DepartmentPosition::class, 'department_position_id');
    }

    public function employeeAssignments()
    {
        return $this->hasMany(EmployeeDepartmentPosition::class, 'assignment_id');
    }
}