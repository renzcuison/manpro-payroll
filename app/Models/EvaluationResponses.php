<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationResponses extends Model
{
    use HasFactory;

    protected $table = 'evaluation_responses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_id',
    ];

    public function form()
    {
        return $this->belongsTo(EvaluationForm::class, 'form_id');
    }

    public function indicatorResponses()
    {
        return $this->hasMany(EvaluationIndicatorResponses::class, 'response_id');
    }
}
