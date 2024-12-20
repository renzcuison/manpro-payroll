<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrEmployeeBenefit extends Model
{
    use HasFactory;

    protected $table = 'hr_employee_benefits';

    protected $primaryKey = 'benefits_id';

    public $timestamps = false;
}
