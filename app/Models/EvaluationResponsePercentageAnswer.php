<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationResponsePercentageAnswer extends Model
{
    use HasFactory;

    protected $table = 'evaluation_response_percentage_answers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'response_id',
        'subcategory_id',
        'percentage',
        'deleted_at'
    ];

    public function response()
    {
        return $this->belongsTo(EvaluationResponse::class, 'response_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(EvaluationFormSubcategory::class, 'subcategory_id');
    }

}
