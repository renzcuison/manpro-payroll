<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CategoryPerformanceRating extends Model
{
    use HasFactory;

    protected $table = 'categories_performance_ratings';

    protected $primaryKey = 'rate_id';

    public $timestamps = false; // Add this line to disable timestamps

    protected $fillable = [
        'rating_name',
        'rating_from',
        'rating_to',
        'performance_id',
        'performance_type',
        'description',
        'team',
        'created_at',
    ];
}
