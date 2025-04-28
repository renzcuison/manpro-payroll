<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationsOvertimeModel extends Model
{
    use HasFactory;

    protected $table = 'applications_overtime';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'client_id',
        'time_in_id',
        'time_out_id',
        'reason',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function timeIn()
    {
        return $this->belongsTo(AttendanceLogsModel::class, 'time_in_id');
    }

    public function timeOut()
    {
        return $this->belongsTo(AttendanceLogsModel::class, 'time_out_id');
    }
}
