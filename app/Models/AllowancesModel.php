<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AllowancesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'allowances';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'type',
        'amount',
        'percentage',
        'payment_schedule',
        'client_id',
    ];
}

//note about payment_schedule:
// accepts int values, each value has their own corresponding scheduling types
// 1. One Time - First Cutoff
// 2. One Time - Second Cutoff
// 3. Split - First & Second Cutoff
