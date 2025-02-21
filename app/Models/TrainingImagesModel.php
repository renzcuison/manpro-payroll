<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingImagesModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'training_images';

    protected $fillable = [
        'training_id',
        'order',
        'path',
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }
}
