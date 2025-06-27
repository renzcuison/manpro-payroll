<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AttendanceSummary extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'attendance_summaries';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'client_id',
        'work_hour_id',

        'work_day_start',
        'work_day_end',
        'day_type',

        'minutes_rendered',
        'minutes_late',
        'minutes_overtime',
        'minutes_night_differential',

        'latest_log_id',
    ];

    public function logs()
    {
        return $this->hasMany(AttendanceLogsModel::class, 'attendance_summary_id');
    }
}
