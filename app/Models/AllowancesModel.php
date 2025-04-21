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
        'client_id',
    ];
}
