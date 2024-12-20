<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class HrWorkday extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'hr_workdays';

    protected $primaryKey = 'workday_id';

    public $timestamps = false;

    protected $fillable = [
        'title',
        'start_date',
        'end_date',
        'color', //Updated to match table column
        'type',
        'status',
        'percentage',
        'application_id',
        'user_id',
        'applist_id',
        'is_deleted',
        'team',
        'deleted_by',
        'hour_id',
    ];

    public function workShift()
    {
        return $this->belongsTo(HrWorkshifts::class, 'hr_workshift_id');
    }
}
