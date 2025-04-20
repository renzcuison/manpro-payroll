<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeAllowancesModel extends Model
{
    use HasFactory;

    protected $table = 'employee_allowances';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'user_id',
        'allowance_id',
    ];

    public function allowance()
    {
        return $this->belongsTo(AllowancesModel::class, 'allowance_id');
    }
}
