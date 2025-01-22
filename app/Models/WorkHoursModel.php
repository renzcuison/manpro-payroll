<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkHoursModel extends Model
{
    use HasFactory;

    protected $table = 'work_hours';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',

        'first_time_in',
        'first_time_out',
        'second_time_in',
        'second_time_out',
        'over_time_in',
        'over_time_out',
        'break_duration',
    ];
}
