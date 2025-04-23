<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class TrainingFormItemsModel extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $table = 'training_form_items';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_id',
        'type',
        'description',
        'order',
        'value'
    ];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')->singleFile();
    }

    public function form()
    {
        return $this->belongsTo(TrainingFormsModel::class, 'form_id');
    }

    public function choices()
    {
        return $this->hasMany(TrainingFormChoicesModel::class, 'form_item_id');
    }
}
