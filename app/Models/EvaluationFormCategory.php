<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationFormCategory extends Model
{
    use HasFactory;

    protected $table = 'evaluation_form_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'section_id',
        'name',
        'order',
        'deleted_at'
    ];

    public function section()
    {
        return $this->belongsTo(EvaluationFormSection::class, 'section_id');
    }

    public function subcategories()
    {
        return $this->hasMany(EvaluationFormSubcategory::class, 'category_id');
    }

}
