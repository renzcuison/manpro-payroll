<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingFormChoicesModel extends Model
{
    use HasFactory;

    protected $table = 'training_form_choices';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_item_id',
        'description',
        'is_correct'
    ];

    public function item()
    {
        return $this->belongsTo(TrainingFormItemsModel::class, 'training_item_id');
    }
}
