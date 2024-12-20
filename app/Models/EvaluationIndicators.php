<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationIndicators extends Model
{
    use HasFactory;

    protected $table = 'evaluation_indicators';

    protected $primaryKey = 'id';

    protected $fillable = [
        'category_id',
        'indicator',
        'type',
        'description',
    ];

    public function response ()
    {
        return $this->hasOne(EvaluationIndicatorResponses::class, 'indicator_id');
    }
}
