<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationEvaluator extends Model
{
    use HasFactory;

    protected $table = 'evaluation_evaluators';

    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'response_id',
        'evaluator_id',
        'comment',
        'order',
        'signature_filepath',
        'deleted_at'
    ];

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(UsersModel::class, 'evaluator_id');
    }
    
}
