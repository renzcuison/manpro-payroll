<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriesTrainingsAnswer extends Model
{
    protected $table = 'categories_trainings_answers';

    protected $primaryKey = 'answer_id';

    public $timestamps = false;

    protected $fillable = [
        'answer_id',
        'category_id',
        'user_id',
        'question_id',
        'answer_text',
        'checking',
        'created_at',
        'is_deleted',
        'deleted_by',
        'team',
    ];
}
