<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingsModel extends Model
{
    use HasFactory;

    protected $table = 'trainings';

    protected $primaryKey = 'id';

    protected $fillable = [
        'unique_code',
        'title',
        'description',
        'cover_photo',
        'status',
        'start_date',
        'end_date',
        'duration',
        'client_id',
        'created_by',
        'sequential',
    ];

    public function client()
    {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'created_by');
    }

    public function contents()
    {
        return $this->hasMany(TrainingContentModel::class, 'training_id');
    }

    public function views()
    {
        return $this->hasMany(TrainingViewsModel::class, 'training_id');
    }
}
