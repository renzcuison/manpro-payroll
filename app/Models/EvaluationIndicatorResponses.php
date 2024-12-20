<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationIndicatorResponses extends Model
{
    use HasFactory;

    protected $table = 'evaluation_indicator_responses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'response_id',
        'indicator_id',
        'rating',
        'comment',
    ];

    public function response()
    {
        return $this->belongsTo(EvaluationResponses::class, 'response_id');
    }

    public function indicator()
    {
        return $this->belongsTo(EvaluationIndicators::class, 'indicator_id');
    }
}
