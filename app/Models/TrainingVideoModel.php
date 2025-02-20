<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingVideoModel extends Model
{
    use HasFactory;

    protected $table = 'training_video';

    protected $fillable = [
        'training_id',
        'path',
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }
}
