<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PemeModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peme';

    protected $fillable = [
        'peme_requirement_id',
        'start_date',
        'expiration_date',
    ];

    public function requirement()
    {
        return $this->belongsTo(PemeRequirementsModel::class, 'peme_requirement_id');
    }

    public function responses()
    {
        return $this->hasMany(PemeResponsesModel::class, 'peme_id');
    }

}
