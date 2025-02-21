<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingsModel extends Model
{
    use HasFactory;

    protected $table = 'trainings';

    protected $fillable = [
        'training_course_id',
        'title',
        'description',
        'cover_photo',
        'client_id',
        'created_by',
        'status',
        'start_date',
        'end_date',
        'duration',
    ];


    public function client()
    {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(UsersModel::class, 'created_by');
    }

    public function videos()
    {
        return $this->hasMany(TrainingVideoModel::class, 'training_id');
    }

    public function views()
    {
        return $this->hasMany(TrainingViewsModel::class, 'training_id');
    }
}
