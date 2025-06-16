<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalaryPlansModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'salary_plans';

    protected $primaryKey = 'id';

    protected $fillable = [
        'salary_grade',
        'amount',
        'client_id',
    ];
}
