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
        'training_content_id',
        'status',
        'completed_at'
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }

    public function content()
    {
        return $this->belongsTo(TrainingContentModel::class, 'training_content_id');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function responses()
    {
        return $this->hasMany(TrainingFormResponsesModel::class, 'training_view_id');
    }
}
