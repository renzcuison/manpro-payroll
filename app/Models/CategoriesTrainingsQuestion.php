<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriesTrainingsQuestion extends Model
{
    protected $table = 'categories_trainings_questions';

    protected $primaryKey = 'question_id';

    public $timestamps = false;

    protected $fillable = [
        'question_id',
        'category_id',
        'author_id',
        'question_text',
        'choice_text',
        'answer_key',
        'is_deleted',
        'deleted_by',
        'team',
    ];
}
