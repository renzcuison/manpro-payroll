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
        'second_label',

        'work_hour_id',
        'client_id',

        'deleted_at',
    ];
}
