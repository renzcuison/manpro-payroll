<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HrApplicationStatus extends Model
{
    use HasFactory;

    protected $table = 'hr_application_status';

    protected $primaryKey = 'app_status_id';

    protected $fillable = [
        'app_status_name',
        'color',
        'is_deleted',
        'team',
        'created_at',
    ];
}
