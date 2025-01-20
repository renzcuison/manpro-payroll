<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkDaysModel extends Model
{
    use HasFactory;

    protected $table = 'work_days';

    protected $primaryKey = 'id';

    protected $fillable = [
        'title',
        
        'start_date',
        'end_date',
        'color',

        'client_id',
        'work_group_id',

        'deleted_at',
        'deleted_by',
    ];
}
