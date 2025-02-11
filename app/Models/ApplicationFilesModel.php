<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;


class ApplicationFilesModel extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'application_files';

    protected $primaryKey = 'id';

    protected $fillable = [
        'application_id',
        'type',
        'path',
    ];
}
