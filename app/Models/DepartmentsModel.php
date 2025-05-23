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
}
