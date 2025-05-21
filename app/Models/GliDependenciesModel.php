<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GliDependenciesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'gli_dependencies';

    protected $fillable =
    [
        'name',
        'relationship',
        'gli_id',
    ];

    public function gli() 
    {
        return $this->belongsTo(GroupLifeInsurancesModel::class, 'gli_id');
    }
}
