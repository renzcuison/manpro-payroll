<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeStatusModel extends Model
{
    use HasFactory;

    protected $table = 'employee_status';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'status',
        'client_id',
    ];
}
