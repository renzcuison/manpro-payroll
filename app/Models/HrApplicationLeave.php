<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrApplicationLeave extends Model
{
    use HasFactory;

    protected $table = 'hr_application_leave';

    protected $primaryKey = 'leave_id';

    public $timestamps = false;

    protected $fillable = [
        'appList_id',
        'user_id',
        'title',
        'leave_limit',
        'app_hours',
        'total_limit',
        'team',
        'created_at',
        'modified_at',
    ];
}
