<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrWorkshifts extends Model
{
    use HasFactory;
    protected $table = 'hr_workshifts';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'hr_workinghours_id',
        'hr_workdays_id',
        'team',
        'description', 
    ];

    public function user()
    {
        return $this->hasMany(User::class, 'hr_workshift_id');
    }

    public function workhour()
    {
        return $this->hasOne(HrWorkhour::class, 'hr_workshift_id');
    }

    public function workday()
    {
        return $this->hasOne(HrWorkday::class, 'hr_workshift_id');
    }
}
