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
}
