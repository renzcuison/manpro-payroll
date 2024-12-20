<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriesEvaluationForm extends Model
{
    use HasFactory;

    protected $table = 'categories_evaluation_form';

    protected $primaryKey = 'evaluation_id';

    public $timestamps = false; // Add this line to disable timestamps

    protected $fillable = [
        'category_id',
        'performance_id',
        'performance_name',
        'performance_type',
        'performance_comment',
        'team',
        'selected_rating_name',
        'selected_rating_from',
        'selected_rating_to',
        'created_at',
        'modified_at',
        'is_deleted',
        'deleted_by',   
    ];
}
