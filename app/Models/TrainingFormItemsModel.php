<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFormItemsModel extends Model
{
    use HasFactory;

    protected $table = 'training_form_items';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_id',
        'type',
        'description',
        'order',
        'value'
    ];

    public function form()
    {
        return $this->belongsTo(TrainingFormsModel::class, 'training_form_id');
    }

    public function choices()
    {
        return $this->hasMany(TrainingFormChoicesModel::class, 'training_item_id');
    }
}
