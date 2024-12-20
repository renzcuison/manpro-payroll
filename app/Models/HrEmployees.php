<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrEmployees extends Model
{
    use HasFactory;

    protected  $table = 'hr_employees';

    protected $primaryKey = 'emp_id';

    protected $fillable = [
        'photo',
        'firstname',
        'lastname',
        'position',
        'birth_date',
        'email',
        'contact_number',
        'address',
        'is_deleted'
    ];
}