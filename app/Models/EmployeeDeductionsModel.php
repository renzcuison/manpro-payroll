<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDeductionsModel extends Model
{
    use HasFactory;

    protected $table = 'employee_deductions';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'user_id',
        'deduction_id',
        'number',
    ];

    public function deduction()
    {
        return $this->belongsTo(DeductionsModel::class, 'deduction_id');
    }
}
