<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationForm extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'evaluation_forms';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'creator_id',
        'deleted_at'
    ];

    public function creator()
    {
        return $this->belongsTo(UsersModel::class, 'creator_id');
    }

    public function responses()
    {
        return $this->hasMany(EvaluationResponse::class, 'form_id');
    }

    public function sections()
    {
        return $this->hasMany(EvaluationFormSection::class, 'form_id');
    }

}
