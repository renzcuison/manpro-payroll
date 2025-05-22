<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationFormSubcategory extends Model
{
    use HasFactory;

    protected $table = 'evaluation_form_subcategories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'category_id',
        'name',
        'rank',
        'subcategory_type',
        'description',
        'required',
        'allow_other_option',
        'linear_scale_start',
        'linear_scale_end',
        'deleted_at'
    ];

    public function category()
    {
        return $this->belongsTo(EvaluationFormCategory::class, 'category_id');
    }

    public function option_answers()
    {
        return $this->hasMany(EvaluationResponseOptionAnswer::class, 'subcategory_id');
    }

    public function options()
    {
        return $this->hasMany(EvaluationFormSubcategoryOption::class, 'subcategory_id');
    }

    public function percentage_answers()
    {
        return $this->hasMany(EvaluationResponsePercentageAnswer::class, 'subcategory_id');
    }

    public function text_answers()
    {
        return $this->hasMany(EvaluationResponseTextAnswer::class, 'subcategory_id');
    }

}
