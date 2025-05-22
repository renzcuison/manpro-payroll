<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationResponseOptionAnswer extends Model
{
    use HasFactory;

    protected $table = 'evaluation_response_option_answers';

    protected $primaryKey = 'id';

    protected $fillable = [
        'response_id',
        'subcategory_id',
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

    public function subcategory()
    {
        return $this->belongsTo(EvaluationFormSubcategory::class, 'subcategory_id');
    }

}
