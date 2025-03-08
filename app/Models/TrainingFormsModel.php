<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFormsModel extends Model
{
    use HasFactory;

    protected $table = 'training_forms';

    protected $primaryKey = 'id';

    protected $fillable = [
        'points',
        'duration'
    ];

    public function trainingContents()
    {
        return $this->morphOne(TrainingContentModel::class, 'content');
    }

    public function items()
    {
        return $this->hasMany(TrainingFormItemsModel::class, 'training_form_id');
    }
}
