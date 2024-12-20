<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoriesEvaluationFormRating extends Model
{
    use HasFactory;

    protected $table = 'categories_evaluation_form_ratings';

    protected $primaryKey = 'rate_form_id';

    public $timestamps = false; // Add this line to disable timestamps

    protected $fillable = [
        'category_id',
        'evaluation_id',
        'rating_name',
        'rating_from',
        'rating_to',
        'performance_id',
        'performance_type',
        'description',
        'team',
        'created_at',
        'modified_at',
        'is_deleted',
        'deleted_by',   
    ];
}
