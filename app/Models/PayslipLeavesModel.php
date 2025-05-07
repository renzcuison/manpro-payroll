<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayslipLeavesModel extends Model
{
    use HasFactory;

    protected $table = 'payslip_leaves';

    protected $primaryKey = 'id';

    protected $fillable = [
        'payslip_id',
        'application_type_id',
        'amount',
        'is_paid',
    ];

    public function applicationType()
    {
        return $this->belongsTo(ApplicationTypesModel::class, 'application_type_id');
    }
}
