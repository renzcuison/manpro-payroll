<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicationTypesModel extends Model
{
    use HasFactory;

    protected $table = 'application_types';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'client_id',
        'deleted_at',
    ];
}
