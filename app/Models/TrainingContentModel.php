<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class TrainingContentModel extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $table = 'training_content';

    protected $primaryKey = 'id';

    protected $fillable = [
        'training_id',
        'order',
        'title',
        'description',
        'duration',
        'source',
        'training_form_id'
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('documents')->singleFile();
        $this->addMediaCollection('powerpoints')->singleFile();
        $this->addMediaCollection('images')->singleFile();
    }

    public function training()
    {
        return $this->belongsTo(TrainingsModel::class, 'training_id');
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
