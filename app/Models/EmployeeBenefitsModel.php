<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeBenefitsModel extends Model
{
    use HasFactory;

    protected $table = 'employee_benefits';

    protected $primaryKey = 'id';

    protected $fillable = [
        'user_id',
        'benefit_id',
        'number',
    ];

    public function benefit()
    {
        return $this->belongsTo(BenefitsModel::class, 'benefit_id');
    }
}
