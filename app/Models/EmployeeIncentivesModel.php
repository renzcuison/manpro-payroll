<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeIncentivesModel extends Model
{
    use HasFactory;

    protected $table = 'employee_incentives';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'user_id',
        'incentive_id',
        'number',
    ];

    public function incentive()
    {
        return $this->belongsTo(IncentivesModel::class, 'incentive_id');
    }
}
