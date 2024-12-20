<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccountingMethod extends Model
{
    use HasFactory;
    protected $table = 'tbl_accounting_method';
    
    protected $primaryKey = 'method_id';

    protected $guarded = [];
    
    public $timestamps = false;
}