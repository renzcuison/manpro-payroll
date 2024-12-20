<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSettlement extends Model
{
    use HasFactory;
    
    protected $table = 'tbl_payment_settled';

    protected $primaryKey = 'settle_id';

    public $timestamps = false;

    protected $guarded = [];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [];
}