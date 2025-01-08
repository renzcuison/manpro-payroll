<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobTitlesModel extends Model
{
    use HasFactory;

    protected $table = 'job_titles';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'acronym',
        'status',
        'client_id',
    ];
}
