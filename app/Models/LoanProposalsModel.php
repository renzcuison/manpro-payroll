<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanProposalsModel extends Model
{   
    use HasFactory;
    use SoftDeletes;

    protected $table = 'loan_proposals';

    protected $fillable = [
        'loan_application_id',
        'proposed_loan_amount',
        'proposed_payment_term',
        'monthly_interest_rate',
        'proposed_monthly_payment',
        'status',
        'created_by'
    ];


    public function loanApplication()
    {
        return $this->belongsTo(LoanApplicationsModel::class, 'loan_application_id');
    }

    public function creator()
    {
        return $this->belongsTo(UsersModel::class, 'created_by');
    }
}