<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Category extends Model
{
    use HasFactory, HasApiTokens;

    protected $table = 'categories';

    protected $primaryKey = 'category_id';

    public $timestamps = false; // Add this line to disable timestamps

    protected $fillable = [
        'category',
        'title',
        'description',
        'attached_file',
        'cover_type',
        'author_id',
        'author_comment',
        'author_date',
        'employee_id',
        'employee_date',
        'employee_role',
        'evaluator_id',
        'evaluator_comment',
        'evaluator_date',
        'date',
        'signature',
        'evaluator_signature',
        'course_type',
        'duration',
        'video_link',
        'date_from_val',
        'date_to_val',
        'team',
        'deleted_by',
        'color',
        'processtype',
        'overall_rating_name',
        'overall_rating_from',
        'overall_rating_to',
        'overall_rating_comment'
    ];
}
