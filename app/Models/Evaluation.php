<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $table = 'evaluation';

    protected $primaryKey = 'id';

    protected $fillable = [
        'client_id',
        'team',
        'name',
        'creator_id',
        'is_deleted',
        'deleted_by',
        'created_at',
        'updated_at',
    ];

    public function categories()
    {
        return $this->hasMany(EvaluationCategory::class, 'evaluation_id');
    }
}
