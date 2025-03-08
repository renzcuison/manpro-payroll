<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFormResponsesModel extends Model
{
    use HasFactory;

    protected $table = 'training_form_responses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'training_view_id',
        'score',
    ];

    public function view()
    {
        return $this->belongsTo(TrainingViewsModel::class, 'training_view_id');
    }

    public function answers()
    {
        return $this->hasMany(TrainingFormAnswersModel::class, 'form_response_id');
    }
}
