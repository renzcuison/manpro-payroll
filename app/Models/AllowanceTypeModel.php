<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AllowanceTypeModel extends Model
{
    use HasFactory;

    protected $table = 'allowance_types';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'amount',
        'percentage',
        'client_id',
    ];
}
