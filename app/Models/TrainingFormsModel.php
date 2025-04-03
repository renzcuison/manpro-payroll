<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFormsModel extends Model
{
    use HasFactory;

    protected $table = 'training_forms';

    protected $primaryKey = 'id';

    protected $fillable = [
        'require_pass',
        'passing_score',
        'attempts_allowed'
    ];

    public function items()
    {
        return $this->hasMany(TrainingFormItemsModel::class, 'form_id');
    }
}
