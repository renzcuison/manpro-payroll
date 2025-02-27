<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingViewsModel extends Model
{
    use HasFactory;

    protected $table = 'training_views';

    protected $fillable = [
        'user_id',
        'training_id',
        'training_media_id',
        'status'
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }

    public function media()
    {
        return $this->belongsTo(TrainingMediaModel::class, 'training_media_id');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }
}
