<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalAllowancesLogsModel extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'medical_allowance_logs';

    protected $fillable = [
        'medical_allowance_id',
        'old_amount',
        'new_amount',
    ];

    public function medicalAllowance()
    {
        return $this->belongsTo(MedicalAllowancesModel::class, 'medical_allowance_id');
    }

}
