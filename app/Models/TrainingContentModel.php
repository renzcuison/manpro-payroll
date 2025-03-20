<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingContentModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'training_content';

    protected $primaryKey = 'id';

    protected $fillable = [
        'training_id',
        'order',
        'title',
        'description',
        'content'
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }

    public function content()
    {
        return $this->morphTo();
    }

    public function views()
    {
        return $this->hasMany(TrainingViewsModel::class, 'training_content_id');
    }
}
