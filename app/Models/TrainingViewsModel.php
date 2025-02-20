<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingViewsModel extends Model
{
    use HasFactory;

    protected $table = 'training_views';

    protected $fillable = [
        'training_id',
        'user_id',
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }
}
