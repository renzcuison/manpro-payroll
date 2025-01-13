<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkGroupsModel extends Model
{
    use HasFactory;

    protected $table = 'work_groups';

    protected $primaryKey = 'id';

    protected $fillable = [
        'name',
        
        'work_shift_id',
        'client_id',
        'deleted_at',
    ];
}
