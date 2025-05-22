<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationForm extends Model
{
    use HasFactory;

    protected $table = 'evaluation_forms';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'creator_id',
        'deleted_at'
        // 'evaluation_id',
        // 'employee_id',
        // 'evaluator_id',
        // 'date',
        // 'period_from',
        // 'period_to',
        // 'is_deleted',
        // 'deleted_by',
        // 'creator_id',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function responses()
    {
        return $this->hasMany(EvaluationResponse::class, 'form_id');
    }

    public function sections()
    {
        return $this->hasMany(EvaluationFormSection::class, 'section_id');
    }

    // public function evaluation()
    // {
    //     return $this->belongsTo(Evaluation::class, 'evaluation_id');
    // }

    // public function employee()
    // {
    //     return $this->belongsTo(User::class, 'employee_id', 'user_id');
    // }

    // public function evaluator()
    // {
    //     return $this->belongsTo(User::class, 'evaluator_id', 'user_id');
    // }

    // public function responses()
    // {
    //     return $this->hasMany(EvaluationResponse::class, 'form_id');
    // }
}
