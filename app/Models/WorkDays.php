<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkDays extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'work_days';

    protected $primaryKey = 'id';

    protected $fillable = [
        'work_shift_id',
        'work_day',
    ];
}
