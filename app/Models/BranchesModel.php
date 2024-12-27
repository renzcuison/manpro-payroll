<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BranchesModel extends Model
{
    use HasFactory;

    protected $table = 'branches';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        'acronym',
        'address',
        'status',
        'client_id',
    ];
}
