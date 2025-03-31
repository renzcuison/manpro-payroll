<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingFormChoicesModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'training_form_choices';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_item_id',
        'description',
        'is_correct'
    ];

    public $timestamps = false;

    public function item()
    {
        return $this->belongsTo(TrainingFormItemsModel::class, 'form_item_id');
    }
}
