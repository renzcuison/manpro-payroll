<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkShiftsModel extends Model
{
    use HasFactory;

    protected $table = 'workshifts';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'shift_type',

        'regular_time_in',
        'regular_time_out',

        'split_first_label',
        'split_first_time_in',
        'split_first_time_out',

        'split_second_label',
        'split_second_time_in',
        'split_second_time_out',

        'over_time_in',
        'over_time_out',

        'client_id',
        'deleted_at',
    ];
}
