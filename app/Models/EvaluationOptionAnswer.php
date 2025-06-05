<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationOptionAnswer extends Model
{
    use HasFactory;

    protected $table = 'evaluation_option_answers';

    protected $primaryKey = ['response_id', 'option_id'];

    protected $fillable = [
        'response_id',
        'option_id',
        'deleted_at'
    ];

    public function option()
    {
        return $this->belongsTo(EvaluationFormSubcategoryOption::class, 'option_id');
    }

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

}
