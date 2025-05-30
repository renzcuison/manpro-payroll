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
        'section_id',
        'name',
        'order',
        'subcategory_type',
        'description',
        'required',
        'allow_other_option',
        'linear_scale_start',
        'linear_scale_end',
        'deleted_at'
    ];

    public function section()
    {
        return $this->belongsTo(EvaluationFormSection::class, 'section_id');
    }

    public function optionAnswers()
    {
        return $this->hasMany(EvaluationOptionAnswer::class, 'subcategory_id');
    }

    public function options()
    {
        return $this->hasMany(EvaluationFormSubcategoryOption::class, 'subcategory_id');
    }

    public function percentageAnswers()
    {
        return $this->hasMany(EvaluationPercentageAnswer::class, 'subcategory_id');
    }

    public function textAnswers()
    {
        return $this->hasMany(EvaluationTextAnswer::class, 'subcategory_id');
    }

}
