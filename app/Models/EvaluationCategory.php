<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationCategory extends Model
{
    use HasFactory;

    protected $table = 'evaluation_categories';

    protected $primaryKey = 'id';

    protected $fillable = [
        'evaluation_id',
        'name',
    ];

    public function evaluation()
    {
        return $this->belongsTo(Evaluation::class, 'evaluation_id');
    }

    public function indicators()
    {
        return $this->hasMany(EvaluationIndicators::class, 'category_id');
    }
}
