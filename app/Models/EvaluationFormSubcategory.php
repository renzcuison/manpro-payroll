<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationFormSubcategory extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'evaluation_form_subcategories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'section_id',
        'name',
        'description',
        'order',
        'subcategory_type',
        'required',
        'allow_other_option',
        'linear_scale_start',
        'linear_scale_end',
        'linear_scale_start_label',
        'linear_scale_end_label', 
        'deleted_at'
    ];

    public function section()
    {
        return $this->belongsTo(EvaluationFormSection::class, 'section_id');
    }

    public function options()
    {
       return $this->hasMany(EvaluationFormSubcategoryOption::class, 'subcategory_id', 'id')
            ->select(['id', 'subcategory_id', 'label', 'score', 'order', 'description'])
            ->orderBy('order');
    }

    public function percentageAnswer()
    {
        return $this->hasOne(EvaluationPercentageAnswer::class, 'subcategory_id');
    }

    public function textAnswer()
    {
        return $this->hasOne(EvaluationTextAnswer::class, 'subcategory_id');
    }

}
