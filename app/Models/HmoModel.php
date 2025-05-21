<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HmoModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo';

    protected $fillable = [
        'user_id',
        'dependencies_limit',
        'coverage_start',
        'coverage_end',
        'hmo_type_id',
    ];

    public function user()
    {
        return $this->belongsTo(UsersMode::class, 'user_id');
    }

    public function hmoType()
    {
        return $this->belongsTo(HmoTypesModel::class, 'hmo_type_id');
    }
}
