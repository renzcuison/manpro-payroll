<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrWorkhour extends Model
{
    use HasFactory;

    protected $table = 'hr_workhours';

    protected $primaryKey = 'hour_id';

    public $timestamps = false;

    protected $fillable = [
        'morning_label',
        'hours_morning_in',
        'hours_morning_out',
        'afternoon_label',
        'hours_afternoon_in',
        'hours_afternoon_out',
        //Changed below to match table columns
        'noon_break',
        'team',
        'hr_workshift_id',
        //'hours_team_in',
    ];

    public function workShift()
    {
        return $this->belongsTo(HrWorkshifts::class, 'hr_workshift_id');
    }
}
