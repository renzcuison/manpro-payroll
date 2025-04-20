<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AllowancesModel extends Model
{
    use HasFactory;

    protected $table = 'allowances';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'amount',
        'percentage',
        'client_id',
    ];
}
