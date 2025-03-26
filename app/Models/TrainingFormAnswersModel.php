<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFormAnswersModel extends Model
{
    use HasFactory;

    protected $table = 'training_form_answers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_response_id',
        'form_item_id',
        'form_choice_id',
        'description',
        'score',
    ];

    public function response()
    {
        return $this->belongsTo(TrainingFormResponsesModel::class, 'form_response_id');
    }

    public function choice()
    {
        return $this->belongsTo(TrainingFormChoicesModel::class, 'form_choice_id');
    }
}
