<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentPositionsModel extends Model
{
    use HasFactory;

    protected $table = 'department_positions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'position_name',
        'can_review_request',
        'can_approve_request',
        'can_note_request',
        'can_accept_request',
    ];
    
    public function userAssignments()
    {
        return $this->hasMany(EmployeeDepartmentPosition::class, 'department_position_id');
    }
}
