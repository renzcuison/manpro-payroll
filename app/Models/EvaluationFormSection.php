<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationFormSection extends Model
{
    use HasFactory;

    protected $table = 'evaluation_form_sections';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_id',
        'name',
        'rank',
        'deleted_at'
    ];

    public function form()
    {
        return $this->belongsTo(EvaluationForm::class, 'form_id');
    }

    public function categories()
    {
        return $this->hasMany(EvaluationFormCategory::class, 'section_id');
    }


}
