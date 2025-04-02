<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanApplicationsModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'loan_applications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'employee_id',
        'loan_amount',
        'reason',
        'status',
        'payment_term',
        'approved_by',
    ];

    public function files()
    {
        return $this->hasMany(LoanApplicationFilesModel::class, 'loan_application_id');
    }
}