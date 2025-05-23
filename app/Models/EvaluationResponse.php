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

    public function form()
    {
        return $this->belongsTo(EvaluationForm::class, 'form_id');
    }

    public function text_answers()
    {
        return $this->hasMany(EvaluationTextAnswer::class, 'response_id');
    }
    
}
