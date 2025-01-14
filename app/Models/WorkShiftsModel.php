<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkShiftsModel extends Model
{
    use HasFactory;

    protected $table = 'work_shifts';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'shift_type',

        'first_label',
        'first_time_in',
        'first_time_out',

        'second_label',
        'second_time_in',
        'second_time_out',

        'over_time_in',
        'over_time_out',

        'client_id',
        'deleted_at',
    ];
}
