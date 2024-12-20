<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrEmployeeBenefitsList extends Model
{
    use HasFactory;

    protected $table = 'hr_employee_benefits_list';

    protected $primaryKey = 'benefitlist_id';

    public $timestamps = false;
}
