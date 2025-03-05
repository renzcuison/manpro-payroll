<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLogsModel extends Model
{
    use HasFactory;

    protected $table = 'attendance_logs';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'work_hour_id',
        'action',
        'method',
        'timestamp',

        // 'machine_number',
        // 'enroll_number',
        // 'enrolled_machine_number',
        // 'verify_mode',

        'deleted_at',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function workHour()
    {
        return $this->belongsTo(WorkHoursModel::class, 'work_hour_id');
    }
}
