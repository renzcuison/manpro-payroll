<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrainingsModel extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'trainings';

    protected $fillable = [
        'training_course_id',
        'title',
        'description',
        'cover_photo',
        'duration',
        'client_id',
        'created_by',
        'start_date',
        'end_date',
    ];


    public function client()
    {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }

    public function creator()
    {
        return $this->belongsTo(UsersModel::class, 'created_by');
    }
}