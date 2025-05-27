<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttendanceSummary extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'attendance_logs';

    protected $primaryKey = 'id';

    protected $fillable = [
        'date',
        'day_type',

        'minutes_rendered',
        'minutes_late',
        'minutes_overtime',

        'employee_id',
        'work_hour_id',
    ];
}
