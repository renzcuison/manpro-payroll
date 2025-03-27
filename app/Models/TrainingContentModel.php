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
        'duration',
        'training_media_id',
        'training_form_id'
    ];

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
    }

    public function media()
    {
        return $this->belongsTo(TrainingMediaModel::class, 'training_media_id');
    }

    public function form()
    {
        return $this->belongsTo(TrainingFormsModel::class, 'training_form_id');
    }

    public function views()
    {
        return $this->hasMany(TrainingViewsModel::class, 'training_content_id');
    }
}
