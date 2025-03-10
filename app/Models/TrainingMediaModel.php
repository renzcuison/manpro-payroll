<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingMediaModel extends Model
{
    use HasFactory;

    protected $table = 'training_media';

    protected $primaryKey = 'id';

    protected $fillable = [
        'type',
        'source',
    ];

    public function trainingContent()
    {
        return $this->morphOne(TrainingContentModel::class, 'content');
    }
}
