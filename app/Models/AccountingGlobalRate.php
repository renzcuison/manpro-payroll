<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountingGlobalRate extends Model
{
    use HasFactory;
    
    protected $table = 'tbl_accounting_rate_history';
    
    protected $primaryKey = 'rate_id';

    protected $guarded = [];
    
    public $timestamps = false;
}