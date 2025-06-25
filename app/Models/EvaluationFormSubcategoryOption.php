<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationFormSubcategoryOption extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'evaluation_form_subcategory_options';

    protected $primaryKey = 'id';

    protected $fillable = [
        'subcategory_id',
        'score',
        'label',
        'description',
        'order',
        'deleted_at'
    ];

    public function optionAnswer()
    {
        return $this->hasOne(EvaluationOptionAnswer::class, 'option_id');
    }

    public function subcategory()
    {
        return $this->belongsTo(EvaluationFormSubcategory::class, 'subcategory_id');
    }

}
