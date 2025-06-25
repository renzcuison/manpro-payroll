<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationOptionAnswer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'evaluation_option_answers';

    protected $primaryKey = 'id';

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
