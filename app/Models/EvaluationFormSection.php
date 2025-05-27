<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationFormSection extends Model
{
    use HasFactory;
    use HasFactory, SoftDeletes;

    protected $table = 'evaluation_form_sections';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_id',
        'name',
        'order',
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
