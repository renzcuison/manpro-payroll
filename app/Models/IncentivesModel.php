<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IncentivesModel extends Model
{
    use HasFactory, SoftDeletes;
    protected $table = 'incentives';

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
