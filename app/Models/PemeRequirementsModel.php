<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeRequirementsModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme_requirements';
    
    protected $fillable = [
        'type_id',
    ];
    
    public function type()
    {
        return $this->belongsTo(PemeTypesModel::class, 'type_id');
    }
}
