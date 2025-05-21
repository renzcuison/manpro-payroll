<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GroupLifeInsurancesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'gli';

    protected $fillable = [
        'provider',
        'user_id',
        'dependencies_limit',
        'date_start',
        'date_end',
        'gli_type_id',
    ];

    public function user() 
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function gliType()
    {
        return $this->belongsTo(GliTypesModel::class, 'gli_type_id');
    }
}
