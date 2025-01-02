<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];
}
