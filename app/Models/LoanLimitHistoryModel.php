<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoanLimitHistoryModel extends Model
{
    use HasFactory;

    protected $table = 'loan_limit_history';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'old_limit',
        'new_limit',
        'user_id',
    ];

}
