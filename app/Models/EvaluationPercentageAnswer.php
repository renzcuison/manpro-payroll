<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationPercentageAnswer extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'evaluation_percentage_answers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'response_id',
        'subcategory_id',
        'percentage',
        'deleted_at'
    ];
    
    protected $casts = [
        'linear_scale_index' => 'integer',
        'value' => 'integer'
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
