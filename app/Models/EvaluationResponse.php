<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationResponse extends Model
{
    use HasFactory;

    protected $table = 'evaluation_responses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'deleted_at',
        'period_start_at',
        'period_end_at',
        'signature_filepath',
        'evaluatee_id',
        'evaluator_id',
        'primary_commentor_id',
        'secondary_commentor_id',
        'form_id'
    ];

    public function evaluatee()
    {
        return $this->belongsTo(UsersModel::class, 'evaluatee_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(UsersModel::class, 'evaluator_id');
    }

    public function form()
    {
        return $this->belongsTo(EvaluationForm::class, 'form_id');
    }

    public function optionAnswers()
    {
        return $this->hasMany(EvaluationOptionAnswer::class, 'response_id');
    }

    public function percentageAnswers()
    {
        return $this->hasMany(EvaluationPercentageAnswer::class, 'response_id');
    }

    public function primaryCommentor()
    {
        return $this->belongsTo(UsersModel::class, 'primary_commentor_id');
    }

    public function secondaryCommentor()
    {
        return $this->belongsTo(UsersModel::class, 'secondary_commentor_id');
    }

    public function textAnswers()
    {
        return $this->hasMany(EvaluationTextAnswer::class, 'response_id');
    }
    
}
