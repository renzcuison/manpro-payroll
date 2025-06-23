<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class EmployeeRolesModel extends Model
{
    use HasFactory;

    protected $table = 'employee_roles';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'acronym',
        'status',
        'client_id',
        'can_approve_request',
        'can_review_request',
        'can_note_request',
        'can_accept_request',
    ];

    protected $casts = [
        'can_approve_request' => 'boolean',
        'can_review_request' => 'boolean',
        'can_note_request' => 'boolean',
        'can_accept_request' => 'boolean',
    ];


    public function employees()
{
    return $this->hasMany(User::class, 'role_id');
}



}
    