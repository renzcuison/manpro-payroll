<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BenefitsModel extends Model
{
    use HasFactory;

    protected $table = 'benefits';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'type',
        'employee_percentage',
        'employee_amount',
        'employer_percentage',
        'employer_amount',
        'client_id',
    ];
}
