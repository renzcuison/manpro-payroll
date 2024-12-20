<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationForm extends Model
{
    use HasFactory;

    protected $table = 'evaluation_form';

    protected $primaryKey = 'id';

    protected $fillable = [
        'evaluation_id',
        'employee_id',
        'evaluator_id',
        'date',
        'period_from',
        'period_to',
        'is_deleted',
        'deleted_by',
        'creator_id',
    ];

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class, 'evaluation_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id', 'user_id');
    }

    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_id', 'user_id');
    }

    public function responses()
    {
        return $this->hasMany(EvaluationResponses::class, 'form_id');
    }
}
