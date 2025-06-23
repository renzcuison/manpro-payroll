<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DeductionsModel extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'deductions';

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
