<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLogsMobileModel extends Model
{
    use HasFactory;

    protected $table = 'attendance_logs_mobile';

    protected $primaryKey = 'id';

    protected $fillable = [
        'attendance_id',
        'path',
    ];

    public $timestamps = false;

    public function attendance()
    {
        return $this->belongsTo(AttendanceLogsModel::class, 'attendance_id');
    }
}
