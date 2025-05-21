<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HmoDependenciesModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'hmo_dependencies';

    protected $fillable = [
        'name',
        'relationship',
        'hmo_id',
    ];

    public function hmo()
    {
        return $this->belongsTo(HmoModel::class, 'hmo_id');
    }
}
