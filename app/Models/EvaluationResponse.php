<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class EvaluationResponse extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected $table = 'evaluation_responses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'evaluatee_id',
        'form_id',
        'period_start_at',
        'period_end_at',
        'creator_signature_filepath',
        'evaluatee_signature_filepath',
        'status',
        'current_step',
        'evaluator_completed_at',
        'first_commentor_completed_at',
        'second_commentor_completed_at',
        'evaluatee_acknowledged_at',
        'deleted_at'
    ];

    public function commentors()
    {
        return $this->hasMany(EvaluationCommentor::class, 'response_id');
    }

    public function evaluatee()
    {
        return $this->belongsTo(UsersModel::class, 'evaluatee_id');
    }

    public function evaluators()
    {
        return $this->hasMany(EvaluationEvaluator::class, 'response_id');
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

    public function textAnswers()
    {
        return $this->hasMany(EvaluationTextAnswer::class, 'response_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('signatures');
    }
}