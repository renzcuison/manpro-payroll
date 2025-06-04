<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DepartmentPosition extends Model
{
    use HasFactory;

    protected $table = 'department_positions';

    protected $fillable = [
        'name',
        'can_review_request',
        'can_approve_request',
        'can_note_request',
        'can_accept_request',
    ];

    public function assignments()
    {
        return $this->hasMany(DepartmentPositionAssignment::class);
    }

    public function employees()
    {
        return $this->hasMany(UsersModel::class, 'department_position_id');
    }
}
