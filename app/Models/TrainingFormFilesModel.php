<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingFormFilesModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'training_form_files';

    protected $primaryKey = 'id';

    protected $fillable = [
        'form_item_id',
        'type',
        'source',
    ];
}
