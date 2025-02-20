<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingCoursesModel extends Model
{
    use HasFactory;

    protected $table = 'training_courses';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'client_id',
        'created_by',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function client()
    {
        return $this->belongsTo(ClientsModel::class, 'client_id');
    }
}
