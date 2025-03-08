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
        'form_choice_id',
    ];

    public function response()
    {
        return $this->belongsTo(TrainingFormResponsesModel::class, 'form_response_id');
    }

    public function choice()
    {
        return $this->belongsTo(TrainingItemChoicesModel::class, 'form_choice_id');
    }
}
