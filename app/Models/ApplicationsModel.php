<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationsModel extends Model
{
    use HasFactory;

    protected $table = 'applications';

    protected $primaryKey = 'id';

    protected $fillable = [
        'type_id',
        'duration_start',
        'duration_end',
        'attachment',
        'description',
        'status',
        'user_id',
        'client_id',
    ];

    public function user()
    {
        return $this->belongsTo(UsersModel::class, 'user_id');
    }

    public function type()
    {
        return $this->belongsTo(ApplicationTypesModel::class, 'type_id');
    }
}
