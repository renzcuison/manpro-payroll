<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogsLeaveCreditsModel extends Model
{
    use HasFactory;

    protected $table = 'logs_leave_credits';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'leave_credit_id',
        'action',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function leaveCredit()
    {
        return $this->belongsTo(LeaveCreditsModel::class, 'leave_credit_id');
    }
}
