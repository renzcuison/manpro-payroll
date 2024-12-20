<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class HrAttendance extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'hr_attendance';

    protected $primaryKey = 'attdn_id';

    public $timestamps = false;

    protected $fillable = [
        'morning_in',
        'morning_out',
        'afternoon_in',
        'afternoon_out',
        'color',
        'start_date',
        'end_date',
        'type',
        'status',
        'user_id',
        'workday_id',
        'application_id',
        'is_deleted',
        'deleted_by',
        'hr_workshift_id',
    ];

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }
}

/*namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

class HRAttendance extends Model
{
    use HasFactory;

    protected  $table = 'hr_attendance';

    protected $primaryKey = 'attendance_id';

    protected $fillable = [
        'morning_in',
        'morning_out',
        'afternoon_in',
        'afternoon_out',
        'color',
        'start_date',
        'end_date',
        'type',
        'status',
        'user_id',
        'workday_id',
        'application_id'
    ];

    // public function user(): BelongsTo
    // {
    //     return $this->belongsTo(User::class);
    // }
}
}*/