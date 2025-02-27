<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingMediaModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'training_media';

    protected $primaryKey = 'id';

    protected $fillable = [
        'training_id',
        'url',
        'type',

    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }

    public function views()
    {
        return $this->hasMany(TrainingViewsModel::class, 'training_media_id');
    }
}
