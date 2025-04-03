<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeTaxesModel extends Model
{
    use HasFactory;

    protected $table = 'employee_taxes';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'client_id',
        'percentage',
        'tin_number',
        'is_active',
    ];
}
