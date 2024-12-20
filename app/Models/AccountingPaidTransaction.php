<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountingPaidTransaction extends Model
{
    use HasFactory;

    protected $table = 'tbl_accounting_paid_transactions';
    
    protected $primaryKey = 'paid_id';

    protected $guarded = [];
    
    public $timestamps = false;
}