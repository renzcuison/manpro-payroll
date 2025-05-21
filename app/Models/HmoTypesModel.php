<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HmoTypesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo_types';

    protected $fillable = [
        'name',
    ];
}
