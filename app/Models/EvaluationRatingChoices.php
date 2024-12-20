<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationRatingChoices extends Model
{
    use HasFactory;

    protected $table = 'evaluation_rating_choices';

    protected $primaryKey = 'id';

    protected $fillable = [
        'evaluation_id',
        'choice',
        'score_min',
        'score_max',
        'description',
    ];
}
